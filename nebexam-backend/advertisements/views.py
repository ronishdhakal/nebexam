from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny

from .models import PopupAd, TextAd
from .serializers import PopupAdSerializer, TextAdSerializer


class PopupAdViewSet(viewsets.ModelViewSet):
    queryset = PopupAd.objects.all()
    serializer_class = PopupAdSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [IsAdminUser()]
        return [IsAdminUser()]


class TextAdViewSet(viewsets.ModelViewSet):
    queryset = TextAd.objects.all()
    serializer_class = TextAdSerializer
    permission_classes = [IsAdminUser]


class ActiveTextAdsView(APIView):
    """Public endpoint — returns active text ads for a given page slug."""
    permission_classes = [AllowAny]

    def get(self, request):
        page = request.query_params.get('page', '')
        ads = TextAd.objects.filter(is_active=True)
        # filter to ads whose pages list contains the requested page
        ads = [ad for ad in ads if page in (ad.pages or [])]
        return Response(TextAdSerializer(ads, many=True).data)


class ActivePopupAdView(APIView):
    """Public endpoint — returns the single active popup ad, or null."""
    permission_classes = [AllowAny]

    def get(self, request):
        ad = PopupAd.objects.filter(is_active=True).first()
        if ad is None:
            return Response(None)
        return Response(PopupAdSerializer(ad, context={'request': request}).data)
