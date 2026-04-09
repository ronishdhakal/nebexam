import csv

from django.http import HttpResponse
from django.utils.timezone import localtime

from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticatedOrReadOnly

from nebexam.pagination import StandardPagination
from .models import StudyAbroadLead
from .serializers import StudyAbroadLeadSerializer


def _get_client_ip(request):
    xff = request.META.get('HTTP_X_FORWARDED_FOR')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


class StudyAbroadLeadSubmitView(generics.CreateAPIView):
    """Public endpoint — anyone can submit. Auth optional (links lead to user)."""
    serializer_class   = StudyAbroadLeadSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user, ip_address=_get_client_ip(self.request))


class StudyAbroadLeadListView(generics.ListAPIView):
    """Admin-only: list leads with optional filters."""
    serializer_class   = StudyAbroadLeadSerializer
    permission_classes = [IsAdminUser]
    pagination_class   = StandardPagination
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['name', 'email', 'phone', 'district', 'other_country']
    ordering_fields    = ['submitted_at', 'name']
    ordering           = ['-submitted_at']

    def get_queryset(self):
        qs = StudyAbroadLead.objects.select_related('user')
        country = self.request.query_params.get('country')
        if country:
            qs = qs.filter(interested_country=country)
        return qs


class StudyAbroadLeadExportView(APIView):
    """Admin-only: export leads as CSV."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = StudyAbroadLead.objects.select_related('user').order_by('-submitted_at')
        country = request.query_params.get('country')
        if country:
            qs = qs.filter(interested_country=country)
        search = request.query_params.get('search', '').strip()
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(name__icontains=search) | Q(email__icontains=search) |
                Q(phone__icontains=search) | Q(district__icontains=search)
            )

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="study_abroad_leads.csv"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'Name', 'Phone', 'Email', 'District', 'Country', 'Other Country', 'Message', 'Linked User', 'Submitted At'])

        COUNTRY_MAP = dict(StudyAbroadLead.COUNTRY_CHOICES)
        for lead in qs:
            country_label = COUNTRY_MAP.get(lead.interested_country, lead.interested_country)
            if lead.interested_country == 'other':
                country_label = f'Other: {lead.other_country}'
            writer.writerow([
                lead.id,
                lead.name,
                lead.phone,
                lead.email,
                lead.district,
                country_label,
                lead.other_country,
                lead.message,
                lead.user.email if lead.user else '',
                localtime(lead.submitted_at).strftime('%Y-%m-%d %H:%M'),
            ])

        return response
