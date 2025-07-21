from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError, AuthenticationFailed, PermissionDenied
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    error_payload = {
        'success': False,
        'error': {
            'code': 'internal_error',
            'message': 'An unexpected error occurred.',
            'details': None
        }
    }

    if response is not None:
        # Default DRF response data can be a list or a dict
        data = response.data
        # Set a default message
        error_payload['error']['message'] = 'An error occurred.'

        if isinstance(exc, ValidationError):
            error_payload['error']['code'] = 'validation_error'
            error_payload['error']['message'] = 'Invalid input.'
            error_payload['error']['details'] = data
        elif isinstance(exc, AuthenticationFailed):
            error_payload['error']['code'] = 'authentication_failed'
            error_payload['error']['message'] = data.get('detail', 'Authentication credentials were not provided.')
        elif isinstance(exc, PermissionDenied):
            error_payload['error']['code'] = 'permission_denied'
            error_payload['error']['message'] = data.get('detail', 'You do not have permission to perform this action.')
        else:
            # Handle other standard DRF errors (NotFound, MethodNotAllowed, etc.)
            if isinstance(data, dict) and 'detail' in data:
                error_payload['error']['code'] = exc.default_code
                error_payload['error']['message'] = data['detail']
            else:
                error_payload['error']['details'] = data

        # Create a new Response with the custom format
        custom_response = Response(error_payload, status=response.status_code)
        return custom_response

    # If the exception is not handled by DRF, return the generic 500 payload
    # Or you can let it raise a 500 error for server logs
    return Response(error_payload, status=500)