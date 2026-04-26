from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class OptionalPagination(PageNumberPagination):
    """Paginates only when ?page= is explicitly provided; returns a plain list otherwise."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 200

    def paginate_queryset(self, queryset, request, view=None):
        if self.page_query_param not in request.query_params:
            return None  # no pagination — caller gets a plain array
        return super().paginate_queryset(queryset, request, view)
