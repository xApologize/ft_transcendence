import json

from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer

users = {
    "A": None,
    "B": None,
}

class PongUserA(WebsocketConsumer):
    def connect(self):
        user_id: int = self.scope.get('user_id')
        if user_id < 0:
            self.accept()
            self.close(3001)
        else:
            self.accept()

    def disconnect(self, close_code):
        close_code = 3001
        print(close_code)
        pass

    def receive(self, text_data):
        if users["B"]:
            users["B"].send(text_data)


class PongUserB(WebsocketConsumer):
    def connect(self):
        users["B"] = self
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        if users["A"]:
            users["A"].send(text_data)


class PongCustomRoon(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.match_id = self.scope['url_route']['kwargs']['match_id']
        print("Channel name:", self.channel_name)
        await self.channel_layer.group_add(
            self.match_id,
            self.channel_name
        )
        await self.send(text_data='Connected to the game. Waiting for opponent...')
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.match_id,
            self.channel_name
        )
        print("Disconnect code:", close_code)
    async def receive(self, text_data):
        print("MESSAGEEEE", text_data)
        await self.channel_layer.group_send(
            self.match_id,
            {
                'type': 'send_input',
                'message': text_data,
                'sender': self.channel_name
            }
        )
    async def send_input(self, event):
        if self.channel_name != event["sender"]:
            await self.send(text_data=event["message"])
