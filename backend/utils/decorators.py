from utils.functions import generate_jwt, verify_token
from django.http import HttpRequest, HttpResponse

def token_validation(func):
    def wrapper(self, request: HttpRequest):
        session_storage_token = request.session.get("jwt_access")
        if session_storage_token:
            print("Token exist")
        else:
            print("Token doesn't exist")
        test = generate_jwt(1, 5)
        validation_result = verify_token(test)
        print(validation_result)
        if validation_result == "Valid":
            return func(self, request)
        elif validation_result == "Expired":
            print("???????????????????????????")
            refresh_token = generate_jwt(30) # fetch from database later
            if verify_token(refresh_token) == "Valid":
                new_token = generate_jwt(30)
                return "new refresh token" # would return new token
        return "make user log back in" # would make user log back in
    return wrapper
