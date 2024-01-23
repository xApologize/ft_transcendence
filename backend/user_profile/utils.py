from django.http import HttpResponseBadRequest
from django.core.files.storage import default_storage
import base64, mimetypes, imghdr, os
from PIL import Image, UnidentifiedImageError
from django.core.exceptions import ValidationError
from utils.functions import checkEmail

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
        if (len(value) > 20 and field != 'email' or len(value) > 50 and field == 'email'):
            return HttpResponseBadRequest(f'{field} is too long')
        if not all(ord(char) < 128 for char in value):
            return HttpResponseBadRequest(f'{field} contains non-ASCII characters')
            
    email = data.get('email', '').strip()
    if email and not checkEmail(email):
        return HttpResponseBadRequest('Invalid email')

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

    if checkEmail(data.get('email', '')) == False:
        return HttpResponseBadRequest('Invalid email')

    for field, value in data.items():
        if len(value) < 3:
            return HttpResponseBadRequest(f'{field} is too short')
        if (len(value) > 20 and field != 'email' or len(value) > 50 and field == 'email'):
            return HttpResponseBadRequest(f'{field} is too long')
        if not all(ord(char) < 128 for char in value):
            return HttpResponseBadRequest(f'{field} contains non-ASCII characters')

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

def validate_image(image_field):
    # Check file extension
    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
    extension = os.path.splitext(image_field.name)[1]
    if extension.lower() not in valid_extensions:
        raise ValidationError(f"Unsupported file extension. Allowed extensions: {', '.join(valid_extensions)}")

    file_size = image_field.file.getbuffer().nbytes
    max_size = 1 * (1024 * 1024)  # 1MB
    if file_size > max_size:
        raise ValidationError("Maximum file size exceeded. Limit is 1MB.")

    try:
        # Temporarily save the image to a BytesIO object to check dimensions and format
        with Image.open(image_field.file) as img:
            img.verify()  # Verify that this is an image
            width, height = img.size
            max_width = 1920
            max_height = 1080
            if width > max_width or height > max_height:
                raise ValidationError(f"Image dimensions should not exceed {max_width}x{max_height}px.")
    except UnidentifiedImageError:
        raise ValidationError("Uploaded file is not a valid image.")
    except ValidationError as e:
        raise ValidationError(e)
    except Exception as e:
        raise Exception("Error: Please do not upload garbage to fail us.")

    # Reset the file pointer after Image.open()
    image_field.file.seek(0)

    # Check for actual image format using imghdr
    image_format = imghdr.what(None, h=image_field.file.read())
    if not image_format:
        raise ValidationError("Invalid image format.")
    
    # Reset the file pointer after checking extensions
    image_field.file.seek(0)