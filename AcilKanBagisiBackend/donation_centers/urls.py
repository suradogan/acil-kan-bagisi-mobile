from django.urls import path
from . import views

urlpatterns = [
    path('centers/', views.get_donation_centers, name='get_donation_centers'),
    path('centers/nearby/', views.get_nearby_centers, name='get_nearby_centers'),
    path('centers/add/', views.add_donation_center, name='add_donation_center'),
] 