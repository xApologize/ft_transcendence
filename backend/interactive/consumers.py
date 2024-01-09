from channels.generic.websocket import AsyncWebsocketConsumer
from interactive.models import LookingForMatch, MatchInvite
from asgiref.sync import sync_to_async
from user_profile.models import User
from channels.layers import get_channel_layer
import json

ECHO = "send_message_echo"
NO_ECHO = "send_message_no_echo"
MAILBOX = "send_mailbox_message"
CLEAN = "send_message_and_clean_db"
MATCH_INVITE = "send_message_match_invite"


class UserInteractiveSocket(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.init: bool = False
            self.user_id: int = self.scope.get("user_id")
            status: str = await self.get_user_status()
        except Exception:
            self.user_id = -1
        if self.user_id < 0 or status == "ONL":
            await self.close()
        else:
            await self.accept()
            await self.channel_layer.group_add  (
                "interactive", self.channel_name)
            self.waiting: bool = False
            await self.set_user_status("ONL")
            await self.send_to_layer(NO_ECHO, self.user_id, "Refresh", "Login")
            await self.send(text_data=json.dumps({"type": "Init"}))
            self.init: bool = True

    async def disconnect(self, close_code: any):
        print("Disconected interactive socket code:", close_code)
        if self.init is False:
            return
        if self.waiting is True:
            print("REMOVED ENTRY FROM DB")
            match_entry = await sync_to_async(
                LookingForMatch.objects.filter(paddleA=self.user_id).first)()
            await sync_to_async(match_entry.delete)()
        await self.channel_layer.group_discard(
            "interactive",
            self.channel_name
        )
        await self.set_user_status("OFF")
        await self.send_to_layer(NO_ECHO, self.user_id, "Refresh", "Logout")

    async def receive(self, text_data: any):
        try:
            data = json.loads(text_data)
            message_type: str = data["type"]
            if message_type in ["Refresh", "Social"]:
                rType: str = data["rType"]
                if message_type == "Social":
                    other_user_id: int = data["other_user_id"]
        except Exception:
            await self.send_error("JSON")
            return
        match message_type:
            case "Find Match":
                await self.find_match()
            case "Send Invite":
                await self.send_invite(data)
            case "Refresh":
                await self.send_to_layer(ECHO, self.user_id, "Refresh", rType)
            case "Social":
                await self.send_to_layer_social(ECHO, self.user_id, "Social", rType, other_user_id)
            case _:
                await self.send_error("argument")

    async def send_message_echo(self, data: any):
        await self.send(text_data=json.dumps(data["message"]))

    async def send_message_no_echo(self, data: any):
        if self.channel_name != data["sender"]:
            await self.send(text_data=json.dumps(data['message']))

    async def send_mailbox_message(self, data: any):
        if self.channel_name == data["sender"]:
            await self.send(text_data=json.dumps(data["message"]))

    async def send_message_and_clean_db(self, data: any):
        if self.channel_name == data["sender"]:
            match_entry = await sync_to_async(
                LookingForMatch.objects.filter(paddleA=self.user_id).first)()
            print("REMOVED ENTRY FROM DB")
            await sync_to_async(match_entry.delete)()
            self.waiting = False
            await self.send(text_data=json.dumps(data["message"]))

    async def send_message_match_invite(self, data: any):
        if self.user_id == data["receiver"]:
            await self.send(text_data=json.dumps(data["message"]))

    async def send_to_layer(self, send_type: str, user_id: int, type: str, rType: str):
        await self.channel_layer.group_send(
            "interactive",
            create_layer_dict(
                send_type, {"type": type, "id": user_id, "rType": rType}, self.channel_name)
            )

    async def send_to_layer_social(self, send_type: str, user_id: int, type: str, rType: str, other_user_id: int):
        await self.channel_layer.group_send(
            "interactive",
            create_layer_dict(
                send_type, {"type": "Refresh", "id": user_id, "rType": rType, "other_user_id": other_user_id}, self.channel_name)
            )

    async def send_error(self, error: str):
        await self.send(text_data=json.dumps({"type": "Invalid", "error": error}))

    async def set_user_status(self, status: str):
        user: User = await sync_to_async(User.objects.get)(pk=self.user_id)
        user.status = status
        await sync_to_async(user.save)()
    
    async def get_user_status(self) -> str:
        user: User = await sync_to_async(User.objects.get)(pk=self.user_id)
        return user.status

    async def find_match(self):
        match_entry = await sync_to_async(LookingForMatch.objects.filter(paddleB=-1).first)()
        if match_entry:
            await self.setup_match(match_entry)
        else:
            await self.create_lfm()

    async def create_lfm(self):
        try:
            await sync_to_async(LookingForMatch.objects.create)(
                    paddleA=self.user_id, mailbox_a=self.channel_name, paddleB=-1)
            self.waiting: bool = True
        except Exception as e:
            print("Create looking for match exception caught:", e)
            await self.send_error("lfm")

    async def setup_match(self, match: any):
        match.paddleB = self.user_id
        try:
            await sync_to_async(match.save)()
            player_a_nick = await self.get_user_nickname(match.paddleA)
            player_b_nick = await self.get_user_nickname(match.paddleB)
            handle_a: dict = await self.create_math_handle(
                match.paddleA, match.paddleB, "A", player_a_nick, player_b_nick
                )
            handle_b: dict = await self.create_math_handle(
                match.paddleA, match.paddleB, "B", player_b_nick, player_a_nick
                )
            await self.channel_layer.group_send(
                "interactive",
                create_layer_dict(
                    CLEAN, handle_a, match.mailbox_a)
                )
            await self.channel_layer.group_send(
                "interactive",
                create_layer_dict(MAILBOX, handle_b, self.channel_name)
                )
        except Exception as e:
            print("Setup match exception caught:", e)
            await self.send_error("lfm")

    @staticmethod
    async def create_math_handle(first_id: int, second_id: int, paddle: str, me: str, opponent: str) -> dict:
        handle = {
            "type": "Found Match",
            "handle": f"wss/pong/{first_id}{second_id}/{paddle}",
            "paddle": paddle,
            "me": me,
            "opponent": opponent
        }
        return handle

    @staticmethod
    async def create_invite_request(sender: int, recipient: int) -> dict:
        handle = {
            "type": "Match Invite",
            "sender": sender,
            "recipient": recipient
        }
        return handle

    @staticmethod
    async def get_user_nickname(user_id: int) -> str:
        user = await sync_to_async(User.objects.get)(pk=user_id)
        return user.nickname

    async def send_invite(self, data: any) -> None:
        try:
            user = data["user"]
            user_object = await sync_to_async(User.objects.get)(nickname=user)
            recipient_id: int = user_object.pk
            await sync_to_async(MatchInvite.objects.create)(
                user_inviting=self.user_id,
                recipient=recipient_id
            )
        except Exception:
            print("No match invite could be created")
            return
        request: dict = await self.create_invite_request(self.user_id, recipient_id)
        await self.channel_layer.group_send(
            "interactive", {
                "type": MATCH_INVITE,
                "message": request,
                "receiver": recipient_id
                }
            )


def create_layer_dict(type: str, message: str, sender: str) -> dict:
    return {"type": type, "message": message, "sender": sender}


async def send_refresh(user_id: int) -> None:
    if user_id is None:
        return
    channel_layer = get_channel_layer()
    if channel_layer is not None:
        await channel_layer.group_send(
            "interactive", {
                "type": "send_message_echo", 
                "message": {"type": "Refresh", "id": user_id, "rType": "User"}
                }
            )
