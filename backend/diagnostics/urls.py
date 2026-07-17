from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LeafAnalysisViewSet, health_check, rejected_feedback

router = DefaultRouter()
router.register("analyses", LeafAnalysisViewSet, basename="leaf-analysis")

urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("rejected-feedback/", rejected_feedback, name="rejected-feedback"),
    path("", include(router.urls)),
]
