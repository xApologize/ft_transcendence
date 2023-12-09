from channels.generic.websocket import AsyncWebsocketConsumer


class UserInteractiveSocket(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope.get("user_id")
        if self.user_id < 0:
            print("Invalid token")
            await self.close()
        else:
            print("SOCKET CONNECTED")
            await self.accept()

    async def disconnect(self, close_code):
        print("DISCONECTED")

    async def receive(self, text_data):
        pass
