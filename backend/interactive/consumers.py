from channels.generic.websocket import AsyncWebsocketConsumer
from interactive.models import LookingForMatch, LookingForMatchClassic
from user_profile.models import User
from game_invite.models import MatchInvite
from tournament.models import Lobby, Tournament, Final
from django.db.models import Q
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
import json

ECHO = "send_message_echo"
NO_ECHO = "send_message_no_echo"
MAILBOX = "send_mailbox_message"
CLEAN = "send_message_and_clean_db"
CLEAN_CLASSIC = "send_message_and_clean_db_classic"
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
        await self.handle_lobby_cleaning()
        await self.handle_tourament_cleaning()
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
            case "Cancel Match":
                await self.cancel_lfm()
            case "Find Match Classic":
                await self.find_match_classic()
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

    async def send_message_and_clean_db_classic(self, data: any):
        if self.channel_name == data["sender"]:
            match_entry = await database_sync_to_async(
                LookingForMatchClassic.objects.filter(paddleA=self.user_id).first)()
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
            if match_entry.paddleA == self.user_id:
                await self.cancel_lfm()
                return
            await self.setup_match(match_entry)
        else:
            await self.create_lfm()
    
    async def cancel_lfm(self):
        try:
            lfm: LookingForMatch = await database_sync_to_async(LookingForMatch.objects.get)(paddleA=self.user_id)
            await database_sync_to_async(lfm.delete)()
            self.waiting = False
            return
        except LookingForMatch.DoesNotExist:
            print("No Upgraded LFM found")
        try:
            lfm_classic: LookingForMatchClassic = await database_sync_to_async(LookingForMatchClassic.objects.get)(paddleA=self.user_id)
            await database_sync_to_async(lfm_classic.delete)()
        except LookingForMatchClassic.DoesNotExist:
            print("Tried deleting classic that doesn't exist?")
            return
        except Exception:
            print("Something went really wrong")
            return

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
            handle_a: dict = await self.create_match_handle(
                match.paddleA, match.paddleB, "A", player_a_nick, player_b_nick, "Found Match"
                )
            handle_b: dict = await self.create_match_handle(
                match.paddleA, match.paddleB, "B", player_b_nick, player_a_nick, "Found Match"
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
    
    async def find_match_classic(self):
        match_entry = await database_sync_to_async(
            LookingForMatchClassic.objects.filter(paddleB=-1).first)()
        if match_entry:
            if match_entry.paddleA == self.user_id:
                await self.cancel_lfm()
                return
            await self.setup_match_classic(match_entry)
        else:
            await self.create_lfm_classic()

    async def setup_match_classic(self, match: any):
        match.paddleB = self.user_id
        try:
            await database_sync_to_async(match.save)()
            player_a_nick = await self.get_user_nickname(match.paddleA)
            player_b_nick = await self.get_user_nickname(match.paddleB)
            handle_a: dict = await self.create_match_handle(
                match.paddleA, match.paddleB, "A", player_a_nick, player_b_nick, "Found Match Classic"
                )
            handle_b: dict = await self.create_match_handle(
                match.paddleA, match.paddleB, "B", player_b_nick, player_a_nick, "Found Match Classic"
                )
            await self.channel_layer.group_send(
                "interactive",
                create_layer_dict(
                    CLEAN_CLASSIC, handle_a, match.mailbox_a)
                )
            await self.channel_layer.group_send(
                "interactive",
                create_layer_dict(MAILBOX, handle_b, self.channel_name)
                )
        except Exception as e:
            print("Setup match exception caught:", e)
            await self.send_error("lfm")
    
    async def create_lfm_classic(self):
        try:
            await database_sync_to_async(LookingForMatchClassic.objects.create)(
                paddleA=self.user_id, mailbox_a=self.channel_name, paddleB=-1)
            self.waiting: bool = True
        except Exception as e:
            print("Create looking for match exception caught:", e)
            await self.send_error("lfm")

    @staticmethod
    async def create_match_handle(
            first_id: int, second_id: int, paddle: str, me: str, opponent: str, type: str) -> dict:
        handle = {
            "type": type,
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
        host_match_handle: dict = await self.create_match_handle(
            self.user_id, recipient_id, "A", host_nickname, recipient_nickname, "Found Match"
        )
        recipient_match_handle: dict = await self.create_match_handle(
                self.user_id, recipient_id, "B", recipient_nickname, host_nickname, "Found Match"
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
            print("FATAL ERROR handler")
            return
        match action_type:
            case "Create":
                await self.create_tournament()
            case "Join":
                await self.join_tournament(data)
            case "Leave":
                await self.leave_tournament()
            case "Cancel":
                await self.cancel_tournament()
            case "Start":
                await self.start_tournament()
            case "Final":
                await self.start_final()

    async def create_tournament(self) -> None:
        try:
            await database_sync_to_async(Lobby.objects.create)(owner=self.user_id)
        except Exception:
            print("Integrity error")
            await self.send(text_data=json.dumps({"type": "Tournament", "rType": "createFailure", "id": self.user_id}))
            return
        await self.send_to_layer(ECHO, self.user_id, "Tournament", "createTournament")
    
    async def leave_tournament(self) -> None:
        try:
            owner_instance: Lobby = await self.get_owner_lobby()
            if owner_instance is not None:
                await self.cancel_tournament()
                print("Stop hacking, owner can't call this usually")
                return
            lobby_instance: Lobby = await database_sync_to_async(Lobby.objects.get)(
                Q(player_2=self.user_id) | Q(
                    player_3=self.user_id) | Q(player_4=self.user_id))
        except Lobby.DoesNotExist:
            print("Tried leaving tournament that doesn't exist")
            await self.send(text_data=json.dumps({"type": "Tournament", "rType": "leaveError", "id": self.user_id}))
            return
        lobby_spot: str = self.find_lobby_spot(lobby_instance, self.user_id)
        if lobby_spot is None:
            print("NO USER FOUND IN LOBBY")
            await self.send(text_data=json.dumps({"type": "Tournament", "rType": "spotError", "id": self.user_id}))
            return
        setattr(lobby_instance, lobby_spot, -1)
        await database_sync_to_async(lobby_instance.save)()
        await self.send_to_layer(ECHO, lobby_instance.owner,"Tournament", "leftTournament")

    async def join_tournament(self, data) -> None:
        try:
            owner_id: int = data["owner_id"]
            lobby_instance: Lobby = await database_sync_to_async(Lobby.objects.get)(owner=owner_id)
            lobby_check: Lobby = await self.check_if_in_lobby()
            print("LOBBY CHECK", lobby_check)
            if lobby_check is not None:
                print("FATAL ERROR join in already lobby...?")
                await self.send(text_data=json.dumps({"type": "Tournament", "rType": "invalidJoin", "id": self.user_id}))
                return
        except Exception:
            print("FATAL ERROR join")
            await self.send(text_data=json.dumps({"type": "Tournament", "rType": "invalidJoin", "id": self.user_id}))
            return
        lobby_spot: str = self.find_lobby_spot(lobby_instance, -1)
        if lobby_spot is None:
            print("Lobby has no spot available")
            await self.send(text_data=json.dumps({"type": "Tournament", "rType": "lobbyFull", "id": self.user_id}))
            return
        setattr(lobby_instance, lobby_spot, self.user_id)
        await database_sync_to_async(lobby_instance.save)()
        await self.send_to_layer(ECHO, owner_id ,"Tournament", "joinTournament")

    async def check_if_in_lobby(self) -> Lobby:
        try:
            lobby_check: Lobby = await database_sync_to_async(Lobby.objects.get)( Q(owner=self.user_id) | Q(player_2=self.user_id) | Q(
                player_3=self.user_id) | Q(player_4=self.user_id))
        except Lobby.DoesNotExist:
            return None
        return lobby_check

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

    async def get_owner_lobby(self) -> Lobby:
        try:
            lobby_instance = await database_sync_to_async(Lobby.objects.get)(owner=self.user_id)
        except Exception:
            print("No Lobby found has owner")
            return None
        return lobby_instance

    async def get_lobby(self) -> Lobby:
        try:
            lobby_instance = await database_sync_to_async(Lobby.objects.get)(Q(player_2=self.user_id) | Q(
                    player_3=self.user_id) | Q(player_4=self.user_id))
        except Exception:
            print("No Lobby found has player's")
            return None
        return lobby_instance

    async def handle_tourament_cleaning(self) -> None:
        tournament_instance: Tournament = await self.get_tournament()
        if tournament_instance is None:
            print("No tourny found to update when disconnected")
            return
        if tournament_instance.player_1 == self.user_id:
            tournament_instance.player_1 = -1
        elif tournament_instance.player_2 == self.user_id:
            tournament_instance.player_2 = -1
        elif tournament_instance.player_3 == self.user_id:
            tournament_instance.player_3 = -1
        else:
            tournament_instance.player_4 = -1
        await database_sync_to_async(tournament_instance.save)()
        print("Saved -1 in tournament")

    async def handle_lobby_cleaning(self) -> None:
        lobby_instance: Lobby = await self.get_owner_lobby()
        if lobby_instance is not None:
            await self.cancel_tournament()
            return
        lobby_instance: Lobby = await self.get_lobby()
        if lobby_instance is not None:
            await self.leave_tournament()
    
    async def cancel_tournament(self) -> None:
        lobby_instance: Lobby = await self.get_owner_lobby()
        if lobby_instance is None:
            print("ERROR CANCEL, NO TOURNY FOUND???")
            await self.send(text_data=json.dumps({"type": "Tournament", "rType": "lobbyFull", "id": self.user_id}))
            return
        owner_id: int = lobby_instance.owner
        await database_sync_to_async(lobby_instance.delete)()
        await self.send_to_layer(NO_ECHO, owner_id ,"Tournament", "cancelTournament")

    async def start_tournament(self) -> None:
        try:
            lobby_instance: Lobby = await database_sync_to_async(Lobby.objects.get)(owner=self.user_id)
            owner_id: int = lobby_instance.owner
            player_2_id: int = lobby_instance.player_2
            player_3_id: int = lobby_instance.player_3
            player_4_id: int = lobby_instance.player_4
            if all(x == -1 for x in [player_2_id, player_3_id, player_4_id]):
                await self.cancel_tournament()
                return
        except Lobby.DoesNotExist:
            print("Tried to start a tournament that doesn't exist")
            await self.send(text_data=json.dumps({"type": "Tournament", "rType": "invalidStart", "id": self.user_id}))
            return
        lobby_instance.open = False
        await database_sync_to_async(lobby_instance.save)()
        await database_sync_to_async(Tournament.objects.create)(
                    player_1=owner_id, player_2=player_2_id,
                        player_3=player_3_id, player_4=player_4_id)
        await database_sync_to_async(lobby_instance.delete)()
        await self.send_to_layer(ECHO, self.user_id ,"Tournament", "startTournament")
        await self.handle_set(owner_id, player_2_id)
        await self.handle_set(player_3_id, player_4_id)
    
    async def handle_set(self, player_1_id: id, player_2_id: id) -> None:
        player_1_nickname: str = await self.get_user_nickname(player_1_id)
        player_2_nicknake: str = await self.get_user_nickname(player_2_id)
        player_1_handle: dict = await self.create_match_handle(
            player_1_id, player_2_id, "A", player_1_nickname, player_2_nicknake, "Tournament Match"
        )
        player_2_handle: dict = await self.create_match_handle(
            player_1_id, player_2_id, "B", player_2_nicknake, player_1_nickname, "Tournament Match"
        )
        await self.send_tourny_handle(player_1_handle, player_1_id)
        await self.send_tourny_handle(player_2_handle, player_2_id)

    async def send_tourny_handle(self, match_handle: dict, id: int) -> None:
        await self.channel_layer.group_send(
            "interactive", {
                "type": MATCH_INVITE,
                "message": match_handle,
                "Receiver": id
                }
            )

    async def get_tournament(self) -> Tournament:
        try:
            tournament_handle: Tournament = await database_sync_to_async(Tournament.objects.get)(
                Q(player_1=self.user_id) | Q(player_2=self.user_id) | Q(player_3=self.user_id) | Q(player_4=self.user_id)
            )
        except Tournament.DoesNotExist:
            return None
        except Final.MultipleObjectsReturned:
            # what are you fucking doing?
            return None
        return tournament_handle
    
    async def find_final(self, unique_id: int) -> Final:
        try:
            final_handle: Final = await database_sync_to_async(Final.objects.get)(final_id=unique_id)
        except Final.DoesNotExist:
            # ...What are you doing here?
            return None
        except Final.MultipleObjectsReturned:
            # Multiple Object returned??? Massive issue
            return None
        return final_handle

    async def create_final(self, unique_id: int) -> None:
        try:
            await database_sync_to_async(Final.objects.create)(
                final_id=unique_id,
                player_1=self.user_id,
                player_2=-1
            )
        except Exception:
            # Add mega error handling.
            return

    async def join_final(self, unique_id: int) -> None:
        try:
            final_handle: Final = await self.find_final(unique_id)
            if final_handle is None:
                # Handle error, no final found...?
                return
            if final_handle.player_2 != -1:
                # Handle trying to join final...?
                return
            final_handle.player_2 = self.user_id
            await database_sync_to_async(final_handle.save)() # Save entry in the db
            player_1_id: int = final_handle.player_1
            await database_sync_to_async(final_handle.delete)()
            player_1_nickname: str = await self.get_user_nickname(player_1_id)
            player_2_nickname: str = await self.get_user_nickname(self.user_id)
            player_1_match_handle: dict = await self.create_match_handle(
                player_1_id, self.user_id, "A", player_1_nickname, player_2_nickname, "Tournament Final"
            )
            player_2_match_handle: dict = await self.create_match_handle(
                player_1_id, self.user_id, "B", player_2_nickname, player_1_nickname, "Tournament Final"
            )
            await self.send_tourny_handle(player_1_match_handle, player_1_id)
            await self.send_tourny_handle(player_2_match_handle, self.user_id)
        except Exception:
            # Couldn't save db entry error
            return

    async def start_final(self) -> None:
        tournament_handle: Tournament = await self.get_tournament()
        if tournament_handle is None:
            print("No tournament handle found...?")
            # Send error to front to go back to the menu since the tournament handle wasn't found.
            return
        final_handle: Final = await self.find_final(tournament_handle.pk) # Entry
        if final_handle is None:
            print("CREATE FINAL")
            await self.create_final(tournament_handle.pk)
        else:
            print("JOIN FINAL")
            await self.join_final(tournament_handle.pk)
            await database_sync_to_async(tournament_handle.delete)()

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
