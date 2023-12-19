from channels.generic.websocket import AsyncWebsocketConsumer
from interactive.models import LookingForMatch, MatchInvite
from asgiref.sync import sync_to_async
from user_profile.models import User
from channels.layers import get_channel_layer
import json


class UserInteractiveSocket(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id: int = self.scope.get("user_id")
        if self.user_id < 0:
            await self.close()
        else:
            await self.accept()
            await self.channel_layer.group_add(
                "interactive", self.channel_name)
            self.waiting: bool = False
            await self.handle_refresh()

    async def disconnect(self, close_code: any):
        print("Disconected interactive socket code:", close_code)
        if self.waiting is True:
            print("REMOVED ENTRY FROM DB")
            match_entry = await sync_to_async(
                LookingForMatch.objects.filter(paddleA=self.user_id).first)()
            await sync_to_async(match_entry.delete)()
        await self.channel_layer.group_discard(
            "interactive",
            self.channel_name
        )
        await self.handle_refresh()

    async def receive(self, text_data: any):
        try:
            data = json.loads(text_data)
            message_type = data["type"]
        except Exception:
            await self.error_handler("JSON")
        match message_type:
            case "Find Match":
                await self.find_match()
            case "Send Invite":
                await self.send_invite(data)
            case "Refresh":
                await self.handle_refresh(data)
            case _:
                await self.error_handler("argument")

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
            await self.error_handler("lfm")

    async def setup_match(self, match: any):
        match.paddleB = self.user_id
        try:
            await sync_to_async(match.save)()
            player_a_nick = await self.get_user_nickname(match.paddleA)
            player_b_nick = await self.get_user_nickname(match.paddleB)
            handle_a: dict = await self.create_math_handle(match.paddleA, match.paddleB, "A", player_a_nick, player_b_nick)
            handle_b: dict = await self.create_math_handle(match.paddleA, match.paddleB, "B", player_b_nick, player_a_nick)
            await self.channel_layer.group_send(
                "interactive",
                create_layer_dict(
                    "send_message_and_clean_db", handle_a, match.mailbox_a)
                )
            await self.channel_layer.group_send(
                "interactive",
                create_layer_dict("send_mailbox_message", handle_b, self.channel_name)
                )
        except Exception as e:
            print("Setup match exception caught:", e)
            await self.error_handler("lfm")

    async def create_math_handle(self, first_id: int, second_id: int, paddle: str, me: str, opponent: str) -> dict:
        handle = {
            "type": "Found Match",
            "handle": f"ws/pong/{first_id}{second_id}/{paddle}",
            "paddle": paddle,
            "me": me,
            "opponent": opponent
        }
        return handle
    
    async def get_user_nickname(self, user_id: int) -> str:
        user = await sync_to_async(User.objects.get)(pk=user_id)
        return user.nickname

    async def create_invite_request(self, sender: id, recipient: id) -> dict:
        handle = {
            "type": "Match Invite",
            "sender": sender,
            "recipient": recipient
        }
        return handle

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
            print("Error")  # TODO add handling error
            return
        request: dict = await self.create_invite_request(self.user_id, recipient_id)
        await self.channel_layer.group_send(
            "interactive", {
                "type": "send_message_match_invite",
                "message": request,
                "receiver": recipient_id
                }
            )

    async def handle_refresh(self):
        await self.channel_layer.group_send(
            "interactive",
            create_layer_dict(
                "send_message_no_echo", {"type": "Refresh"}, self.channel_name)
            )

    async def error_handler(self, error: str):
        self.send(text_data=json.dumps({"type": "Invalid", "error": error}))


def create_layer_dict(type: str, message: str, sender: str) -> dict:
    return {"type": type, "message": message, "sender": sender}

async def send_refresh() -> None:
    channel_layer = get_channel_layer()
    if channel_layer is not None:
        await channel_layer.group_send(
            "interactive", {
                "type": "send_message_echo", 
                "message": {"type": "Refresh"}
                }
            )
