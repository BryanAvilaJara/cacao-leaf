from rest_framework import serializers
from PIL import Image, UnidentifiedImageError

from .classifier import classify_cacao_leaf
from .models import LeafAnalysis


ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024


class LeafAnalysisSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = LeafAnalysis
        fields = [
            "id",
            "image",
            "image_url",
            "status",
            "status_display",
            "confidence",
            "disease_label",
            "recommendation",
            "notes",
            "created_at",
        ]
        read_only_fields = [
            "status",
            "confidence",
            "disease_label",
            "recommendation",
            "notes",
            "created_at",
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if not obj.image:
            return None
        url = obj.image.url
        return request.build_absolute_uri(url) if request else url

    def validate_image(self, image):
        content_type = getattr(image, "content_type", "")
        if content_type and content_type not in ALLOWED_IMAGE_TYPES:
            raise serializers.ValidationError(
                "Formato no permitido. Usa una imagen JPG, PNG o WEBP."
            )

        if image.size > MAX_IMAGE_SIZE_BYTES:
            raise serializers.ValidationError("La imagen no debe superar 5 MB.")

        try:
            image.seek(0)
            with Image.open(image) as candidate:
                candidate.verify()
        except (UnidentifiedImageError, OSError):
            raise serializers.ValidationError("El archivo enviado no es una imagen valida.")
        finally:
            image.seek(0)

        return image

    def create(self, validated_data):
        image = validated_data["image"]
        result = classify_cacao_leaf(image)
        return LeafAnalysis.objects.create(
            image=image,
            status=result.status,
            confidence=round(result.confidence, 2),
            disease_label=result.disease_label,
            recommendation=result.recommendation,
            notes=result.notes,
        )
