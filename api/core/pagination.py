from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class CustomPagination(PageNumberPagination):
    """
    Custom pagination class to provide a consistent response format for paginated data.
    """
    page_size_query_param = 'pageSize' # Allows client to set page size e.g. ?pageSize=10
    
    def get_paginated_response(self, data):
        return Response({
            'success': True,
            'data': {
                'items': data,
                'pagination': {
                    'nextPage': self.get_next_link(),
                    'previousPage': self.get_previous_link(),
                    'count': self.page.paginator.count,
                    'totalPages': self.page.paginator.num_pages,
                    'currentPage': self.page.number,
                }
            }
        })