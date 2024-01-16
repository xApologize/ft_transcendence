from channels.generic.websocket import AsyncWebsocketConsumer
from interactive.models import LookingForMatch
from user_profile.models import User
from game_invite.models import MatchInvite
from tournament.models import Lobby
from django.db.models import Q
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from django.db import IntegrityError
import json

ECHO = "send_message_echo"
NO_ECHO = "send_message_no_echo"
MAILBOX = "send_mailbox_message"
CLEAN = "send_message_and_clean_db"
MATCH_INVITE = "send_message_match_invite"
SEND_LIST_IDS = "send_message_list_ids"


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
            await self.channel_layer.group_add(
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
        await self.handle_lfm_cleaning()
        await self.handle_invite_cleaning()
        # await self.handle_tourmanet_cleaning()
        await self.set_user_status("OFF")
        await self.send_to_layer(NO_ECHO, self.user_id, "Refresh", "Logout")
        await self.channel_layer.group_discard(
            "interactive",
            self.channel_name
        )

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
            case "Game Invite":
                await self.game_invite()
            case "Tournament":
                await self.tournament_handler(data)
            case "Refresh":
                await self.send_to_layer(ECHO, self.user_id, "Refresh", rType)
            case "Social":
                await self.send_to_layer_social(ECHO, self.user_id, rType, other_user_id)
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
            match_entry = await database_sync_to_async(
                LookingForMatch.objects.filter(paddleA=self.user_id).first)()
            print("REMOVED ENTRY FROM DB")
            await database_sync_to_async(match_entry.delete)()
            self.waiting = False
            await self.send(text_data=json.dumps(data["message"]))

    async def send_message_match_invite(self, data: any):
        if self.user_id == data["Receiver"]:
            await self.send(text_data=json.dumps(data["message"]))

    async def send_message_list_ids(self, data: any):
        user_ids = data.get("user_ids", [])
        if self.user_id in user_ids:
            await self.send(text_data=json.dumps(data["message"]))

    async def send_to_layer(self, send_type: str, user_id: int, type: str, rType: str):
        await self.channel_layer.group_send(
            "interactive",
            create_layer_dict(
                send_type, {"type": type, "id": user_id, "rType": rType}, self.channel_name)
            )

    async def send_to_layer_social(
            self, send_type: str, user_id: int, rType: str, other_user_id: int):
        await self.channel_layer.group_send(
            "interactive",
            create_layer_dict(
                send_type, {
                    "type": "Refresh",
                    "id": user_id,
                    "rType": rType,
                    "other_user_id": other_user_id
                }, self.channel_name)
            )

    async def send_error(self, error: str):
        await self.send(text_data=json.dumps({"type": "Invalid", "error": error}))

    async def set_user_status(self, status: str):
        user: User = await database_sync_to_async(User.objects.get)(pk=self.user_id)
        user.status = status
        await database_sync_to_async(user.save)()

    async def get_user_status(self) -> str:
        user: User = await database_sync_to_async(User.objects.get)(pk=self.user_id)
        return user.status

    async def find_match(self):
        match_entry = await database_sync_to_async(
            LookingForMatch.objects.filter(paddleB=-1).first)()
        if match_entry:
            await self.setup_match(match_entry)
        else:
            await self.create_lfm()

    async def create_lfm(self):
        try:
            await database_sync_to_async(LookingForMatch.objects.create)(
                    paddleA=self.user_id, mailbox_a=self.channel_name, paddleB=-1)
            self.waiting: bool = True
        except Exception as e:
            print("Create looking for match exception caught:", e)
            await self.send_error("lfm")

    async def setup_match(self, match: any):
        match.paddleB = self.user_id
        try:
            await database_sync_to_async(match.save)()
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
    async def create_math_handle(
            first_id: int, second_id: int, paddle: str, me: str, opponent: str) -> dict:
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
        user = await database_sync_to_async(User.objects.get)(pk=user_id)
        return user.nickname

    async def game_invite(self) -> None:
        invite: MatchInvite = await database_sync_to_async(
            MatchInvite.objects.filter(user_inviting__id=self.user_id).first)()
        if invite is None:
            print("FATAL ERROR wrong querry sent to the game invite")
            return
        host_nickname: str = await self.get_user_nickname(self.user_id)
        recipient_id: int = await database_sync_to_async(lambda: invite.recipient.pk)()
        recipient_nickname: str = await self.get_user_nickname(recipient_id)
        host_match_handle: dict = await self.create_math_handle(
            self.user_id, recipient_id, "A", host_nickname, recipient_nickname
        )
        recipient_match_handle: dict = await self.create_math_handle(
                self.user_id, recipient_id, "B", recipient_nickname, host_nickname
        )
        await database_sync_to_async(invite.delete)()
        await self.channel_layer.group_send(
            "interactive", {
                "type": MATCH_INVITE,
                "message": {
                    "type": "Refresh",
                    "id": self.user_id,
                    "rType": "refreshGameInvite",
                    "other_user_id": recipient_id
                    }, "Receiver": recipient_id
                    
                })
        await self.channel_layer.group_send(
            "interactive", {
                "type": MATCH_INVITE,
                "message": recipient_match_handle,
                "Receiver": recipient_id
                })
        await self.send(text_data=json.dumps(host_match_handle))

    async def handle_invite_cleaning(self) -> None:
        invite: MatchInvite = await database_sync_to_async(
            MatchInvite.objects.filter(user_inviting__id=self.user_id).first)()
        if invite is None:
            return
        recipient_id: int = await database_sync_to_async(lambda: invite.recipient.pk)()
        await database_sync_to_async(invite.delete)()
        await self.channel_layer.group_send(
            "interactive", {
                "type": MATCH_INVITE,
                "message": {
                    "type": "Refresh",
                    "id": self.user_id,
                    "rType": "refreshGameInvite",
                    "other_user_id": recipient_id
                    }, "Receiver": recipient_id
                })
        print("Invite clean done")

    async def handle_lfm_cleaning(self) -> None:
        if self.waiting is True:
            print("REMOVED ENTRY FROM DB")
            match_entry = await database_sync_to_async(
                LookingForMatch.objects.filter(paddleA=self.user_id).first)()
            await database_sync_to_async(match_entry.delete)()
    
    async def tournament_handler(self, data) -> None:
        try:
            action_type: str = data["action"]
        except Exception:
            print("FATAL ERROR")
            return
        match action_type:
            case "Create":
                await self.create_tournament()
            case "Join":
                await self.join_tournament(data)
            case "Leave":
                await self.leave_tournament()
            # case "Cancel":
            #     await self.cancel_tournament()
        # send all notif send owner id
        #     case "Start":
        # start ?????

    async def create_tournament(self) -> None:
        try:
            await database_sync_to_async(Lobby.objects.create)(owner=self.user_id)
        except IntegrityError:
            print("Integrity error")
            return
        # Send notification to frontend
    
    async def leave_tournament(self) -> None:
        try:
            if self.is_owner_tourny():
                # add cancel tournament call it?
                return
            lobby_instance: Lobby = await database_sync_to_async(Lobby.objects.get)(
                Q(player_2=self.user_id) | Q(
                    player_3=self.user_id) | Q(player_4=self.user_id))
        except Lobby.DoesNotExist:
            print("FATAL ERROR")
            # NOTIFY FRONTEND
            return
        lobby_spot: str = self.find_lobby_spot(lobby_instance, self.user_id)
        if lobby_spot is None:
            print("NO USER FOUND IN LOBBY")
            # NOTIFY FRONTEND
            return
        setattr(lobby_instance, lobby_spot, -1)
        await database_sync_to_async(lobby_instance.save)()
        # NOTIFY FRONTEND

    async def join_tournament(self, data) -> None:
        try:
            owner_id: int = data["owner_id"]
            lobby_instance: Lobby = await database_sync_to_async(Lobby.objects.get)(owner=owner_id)
        except Exception:
            print("FATAL ERROR")
            # SEND ERROR TO FRONT
            return
        lobby_spot: str = self.find_lobby_spot(lobby_instance, -1)
        if lobby_spot is None:
            print("FATAL ERROR NO SPOT")
            # SEND ERROR TO FRONT
            return
        setattr(lobby_instance, lobby_spot, self.user_id)
        await database_sync_to_async(lobby_instance.save)()
        # NOTIFY FRONTEND

    @staticmethod
    def find_lobby_spot(instance: Lobby, id: int) -> str:
        if instance.player_2 == id:
            return "player_2"
        elif instance.player_3 == id:
            return "player_3"
        elif instance.player_4 == id:
            return "player_4"
        return None

    @staticmethod
    def get_users_ids(lobby_instance: Lobby) -> list:
        id_list: list = [lobby_instance.owner]
        if lobby_instance.player_2 != -1:
            id_list.append(lobby_instance.player_2)
        if lobby_instance.player_3 != -1:
            id_list.append(lobby_instance.player_3)
        if lobby_instance.player_4 != -1:
            id_list.append(lobby_instance.player_4)
        return id_list
    
    async def get_owner_tournament(self) -> Lobby:
        try:
            lobby_instance = await database_sync_to_async(Lobby.objects.get)(owner=self.user_id)
        except FileNotFoundError:
            return None
        return lobby_instance
    
    async def get_tournament(self) -> Lobby:
        try:
            lobby_instance = await database_sync_to_async(Lobby.objects.get)(Q(player_2=self.user_id) | Q(
                    player_3=self.user_id) | Q(player_4=self.user_id))
        except FileNotFoundError:
            return None
        return lobby_instance

    async def handle_tourmanet_cleaning(self) -> None:
        lobby_instance: Lobby = self.get_owner_tournament()
        if lobby_instance is not None:
            #clean
            return
        lobby_instance: Lobby = self.get_tournament()
        if lobby_instance is not None:
            # call cancel
            pass



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
