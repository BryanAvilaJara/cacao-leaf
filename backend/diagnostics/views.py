from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import LeafAnalysis
from .serializers import FeedbackReportSerializer, LeafAnalysisSerializer, RejectedImageReportSerializer


@api_view(["GET"])
def health_check(_request):
    return Response({"status": "ok", "service": "cacao-leaf-diagnostics"})


@api_view(["POST"])
def rejected_feedback(request):
    serializer = RejectedImageReportSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    report = serializer.save()
    output = RejectedImageReportSerializer(report)
    return Response(output.data, status=status.HTTP_201_CREATED)


class LeafAnalysisViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = LeafAnalysis.objects.all()
    serializer_class = LeafAnalysisSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        analysis = serializer.save()
        output = self.get_serializer(analysis)
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def feedback(self, request, pk=None):
        analysis = self.get_object()
        serializer = FeedbackReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save(analysis=analysis)
        output = FeedbackReportSerializer(report)
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["delete"])
    def clear(self, _request):
        analyses = list(self.get_queryset())
        count = len(analyses)
        for analysis in analyses:
            if analysis.image:
                analysis.image.delete(save=False)
            analysis.delete()

        return Response({"deleted": count}, status=status.HTTP_200_OK)
