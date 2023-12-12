from channels.generic.websocket import AsyncWebsocketConsumer
from interactive.models import LookingForMatch
from asgiref.sync import sync_to_async
import json


class UserInteractiveSocket(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id: int = self.scope.get("user_id")
        print("Channel name", self.channel_name)
        if self.user_id < 0:
            await self.close()
        else:
            await self.accept()
            await self.channel_layer.group_add(
                "interactive", self.channel_name)
            self.waiting: bool = False

    async def disconnect(self, close_code: any):
        print("Disconected interactive socket code:", close_code)
        if self.waiting == True:
            print("REMOVED ENTRY FROM DB")
            match_entry = await sync_to_async(
                LookingForMatch.objects.filter(paddleA=self.user_id).first)()
            await sync_to_async(match_entry.delete)()
        await self.channel_layer.group_discard(
            "interactive",
            self.channel_name
        )

    async def receive(self, text_data: any):
        data = json.loads(text_data)
        message_type = data["type"]
        print("Json:", message_type)
        if message_type == "Find Match":
            await self.find_match()
        elif message_type == "Refresh User":
            pass
        else:
            print("Invalid input given to socket, check syntax")

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
            print("REMOVE ENTRY FROM DB")
            await sync_to_async(match_entry.delete)()
            self.waiting = False
            await self.send(text_data=json.dumps(data["message"]))

    async def find_match(self):
        match_entry = await sync_to_async(LookingForMatch.objects.filter(paddleB=-1).first)()
        if match_entry:
            await self.setup_match(match_entry)
        else:
            await self.create_lfm()

    async def create_lfm(self):
        print("CREATE MATCH")
        await sync_to_async(LookingForMatch.objects.create)(
                paddleA=self.user_id, mailbox_a=self.channel_name, paddleB=-1)
        self.waiting: bool = True

    async def setup_match(self, match: any):
        print("SETUP MATCH")
        match.paddleB = self.user_id
        await sync_to_async(match.save)()
        handle_a: dict = await self.create_math_handle(match.paddleA, match.paddleB, "A")
        handle_b: dict = await self.create_math_handle(match.paddleA, match.paddleB, "B")
        await self.channel_layer.group_send(
                "interactive",
                create_layer_dict(
                    "send_message_and_clean_db", handle_a, match.mailbox_a)
                )
        await self.channel_layer.group_send(
                "interactive",
                create_layer_dict("send_mailbox_message", handle_b, self.channel_name)
                )

    async def create_math_handle(self, first_id: int, second_id: int, paddle: str) -> dict:
        handle = {
            "type": "Found Match",
            "handle": f"ws/pong/{first_id}{second_id}/{paddle}",
            "paddle": paddle
        }
        return handle


def create_layer_dict(type: str, message: str, sender: str) -> dict:
    return {"type": type, "message": message, "sender": sender}
