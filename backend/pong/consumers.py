from channels.generic.websocket import AsyncWebsocketConsumer


class PongRoom(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.match_id = self.scope['url_route']['kwargs']['match_id']
        self.paddle_side = self.scope['url_route']['kwargs']['paddle_side']
        await self.channel_layer.group_add(
            self.match_id,
            self.channel_name
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.match_id,
            self.channel_name
        )
        print("Pong socket disconnect code:", close_code)
        await self.channel_layer.group_send(
            self.match_id,{
                'type': 'send_input',
                'message': "Closing",
                'sender': self.channel_name
            }
        )

    async def receive(self, text_data):
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
