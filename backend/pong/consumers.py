import json

from channels.generic.websocket import WebsocketConsumer

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
