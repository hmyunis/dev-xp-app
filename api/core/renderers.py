from drf_camel_case.render import CamelCaseJSONRenderer

class CustomJSONRenderer(CamelCaseJSONRenderer):
    """
    A custom renderer to wrap all successful API responses in a consistent format.
    It ensures that the final output is always a JSON object with a 'success' key.
    """
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response')

        # If the response is an error, the custom exception handler will format it.
        # We only wrap successful responses.
        # A response is considered successful if there is no 'success' key yet,
        # and the status code is in the 2xx range.
        if response and 200 <= response.status_code < 300 and data and 'success' not in data:
            # Our custom paginator already formats the response, so we don't re-wrap it.
            # We wrap everything else.
            wrapped_data = {'success': True, 'data': data}
            return super().render(wrapped_data, accepted_media_type, renderer_context)
        
        # For paginated or already-wrapped data, and for errors handled by the exception handler
        return super().render(data, accepted_media_type, renderer_context)