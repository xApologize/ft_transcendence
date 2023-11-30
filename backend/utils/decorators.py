from utils.functions import generate_jwt, verify_token
from django.http import HttpRequest, HttpResponse

def token_validation(func):
    def wrapper(self, request: HttpRequest):
        print(request)
        test = generate_jwt(1, 5) # request.token

        refresh_token = request.COOKIES.get('a')
        print("hey fuckers ", refresh_token)
        access_token = request.headers.get('jwt')
        print("hey bozo !", access_token)
        
        validation_result = verify_token(test)
        if validation_result == "Valid":
            # Ajouter le access Token dans la réponse??
            test: HttpResponse = func(self, request)
            test.set_cookie("a", "deflol", secure=True, httponly=True)
            print("Ret", test)
            return test
        elif validation_result == "Expired":
            refresh_token = generate_jwt(30) # fetch from database later
            if verify_token(refresh_token) == "Valid":
                new_token = generate_jwt(30)
                return "new refresh token" # would return new token
        return "make user log back in" # would make user log back in
    return wrapper
