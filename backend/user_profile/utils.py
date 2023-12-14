from django.http import HttpResponseBadRequest
from django.conf import settings
from io import BytesIO
from django.core.files.storage import default_storage
import base64, mimetypes, logging

DEFAULT_AVATAR_URL = "avatars/default.png"

def check_info_update(data, allowed_fields):
    # Check for extra fields
    extra_fields = data.keys() - allowed_fields
    if extra_fields:
        error_message = f'Unexpected fields: {", ".join(extra_fields)}'
        return HttpResponseBadRequest(error_message) # 400

    # Check for not empty only on fields present in data
    for field, value in data.items():
        if value == '':
            return HttpResponseBadRequest(f'{field} should not be empty') # 400
        # Check if field contains space
        if ' ' in value:
            return HttpResponseBadRequest(f'{field} contains space') # 400
        # Check field length constraints
        if len(value) < 3:
            return HttpResponseBadRequest(f'{field} is too short')
        if (len(value) > 20 and field != 'email') or (len(value) > 50 and field == 'email'):
            return HttpResponseBadRequest(f'{field} is too long')

    return None


def check_info_signup(data, allowed_fields):
    # Check for extra fields
    extra_fields = data.keys() - allowed_fields
    if extra_fields:
        error_message = f'Unexpected fields: {", ".join(extra_fields)}'
        return HttpResponseBadRequest(error_message) # 400
    # Check for missing required fields
    missing_fields = allowed_fields - data.keys()
    if missing_fields:
        error_message = f'Missing required fields: {", ".join(missing_fields)}'
        return HttpResponseBadRequest(error_message) # 400

    # not empty
    if any(data.get(field, '') == '' for field in allowed_fields):
        return HttpResponseBadRequest('Missing one or more required fields') # 400
    # does not contain space
    if any(' ' in data.get(field, '') for field in allowed_fields):
        return HttpResponseBadRequest('Field contain space') # 400

    for field, value in data.items():
        if len(value) < 3:
            return HttpResponseBadRequest(f'{field} is too short')
        if (len(value) > 20 and field != 'email' or len(value) > 50 and field == 'email'):
            return HttpResponseBadRequest(f'{field} is too long')
    return None


def get_image_as_base64(image_path):
    with default_storage.open(image_path, 'rb') as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


def get_avatar_data(user):
    def get_image_data(image_url):
        try:
            return get_image_as_base64(image_url), mimetypes.guess_type(image_url)[0] or 'image/jpeg'
        except FileNotFoundError:
            return None, None

    # Try to get user's avatar
    avatar_base64, content_type = get_image_data(user.avatar.name) if user.avatar else (None, None)

    # Fallback to default avatar if user's avatar is not found or missing
    if not avatar_base64:
        avatar_base64, content_type = get_image_data(DEFAULT_AVATAR_URL)

    # Final fallback if both user's and default avatars are missing
    if not avatar_base64:
        avatar_base64 = ''  # You could use a predefined base64 encoded placeholder image here
        content_type = 'image/jpeg'  # Default content type

    return f'data:{content_type};base64,{avatar_base64}'