from django.urls import path
from .views import (
    DonationListCreateView,
    DonationDetailView,
    EmergencyRequestListCreateView,
    EmergencyRequestDetailView,
    DonationCenterListView,
)

urlpatterns = [
    path('', DonationListCreateView.as_view(), name='donation-list-create'),
    path('<str:pk>/', DonationDetailView.as_view(), name='donation-detail'),
    path('emergency/', EmergencyRequestListCreateView.as_view(), name='emergency-list-create'),
    path('emergency/<str:pk>/', EmergencyRequestDetailView.as_view(), name='emergency-detail'),
    path('centers/', DonationCenterListView.as_view(), name='donation-center-list'),
]
