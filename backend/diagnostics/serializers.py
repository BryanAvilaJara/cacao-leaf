from rest_framework import serializers
from PIL import Image, ImageStat, UnidentifiedImageError

from .classifier import classify_cacao_leaf
from .models import FeedbackReport, LeafAnalysis


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

            image.seek(0)
            with Image.open(image) as candidate:
                if not looks_like_vegetation(candidate):
                    raise serializers.ValidationError(
                        "La imagen no parece corresponder a una hoja o vegetacion. "
                        "Sube una foto clara donde la hoja ocupe la mayor parte de la imagen."
                    )
        except serializers.ValidationError:
            raise
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


class FeedbackReportSerializer(serializers.ModelSerializer):
    reason_display = serializers.CharField(source="get_reason_display", read_only=True)

    class Meta:
        model = FeedbackReport
        fields = ["id", "analysis", "reason", "reason_display", "comment", "created_at"]
        read_only_fields = ["id", "analysis", "reason_display", "created_at"]

    def validate_comment(self, value):
        return value.strip()[:500]


def looks_like_vegetation(image: Image.Image) -> bool:
    rgb_image = image.convert("RGB").resize((96, 96))
    pixels = list(rgb_image.getdata())
    if not pixels:
        return False

    stat = ImageStat.Stat(rgb_image)
    red_mean, green_mean, blue_mean = stat.mean
    brightness = (red_mean + green_mean + blue_mean) / 3

    green_pixels = 0
    earthy_pixels = 0
    artificial_pixels = 0
    very_bright_pixels = 0
    very_dark_pixels = 0

    for red, green, blue in pixels:
        max_channel = max(red, green, blue)
        min_channel = min(red, green, blue)
        pixel_brightness = (red + green + blue) / 3
        saturation = max_channel - min_channel

        if pixel_brightness >= 235:
            very_bright_pixels += 1
        if pixel_brightness <= 25:
            very_dark_pixels += 1

        green_signal = green >= 50 and green >= red * 0.92 and green >= blue * 0.92 and saturation >= 18 and pixel_brightness <= 225
        earthy_signal = (
            red >= 45
            and green >= 32
            and blue <= 95
            and red >= blue + 18
            and green >= blue + 10
            and abs(red - green) <= 85
            and saturation >= 16
        )
        artificial_signal = (
            blue >= 115 and blue >= red + 28 and blue >= green + 20
        ) or (
            red >= 145 and red >= green + 55 and red >= blue + 45
        ) or (
            max_channel >= 185 and saturation >= 95 and not green_signal and not earthy_signal
        )

        if green_signal:
            green_pixels += 1
        if earthy_signal:
            earthy_pixels += 1
        if artificial_signal:
            artificial_pixels += 1

    total = len(pixels)
    green_ratio = green_pixels / total
    earthy_ratio = earthy_pixels / total
    vegetation_ratio = green_ratio + earthy_ratio
    artificial_ratio = artificial_pixels / total
    very_bright_ratio = very_bright_pixels / total
    very_dark_ratio = very_dark_pixels / total

    if very_bright_ratio > 0.72 or very_dark_ratio > 0.82:
        return False

    if artificial_ratio > 0.30 and green_ratio < 0.10:
        return False

    if blue_mean > green_mean + 22 and green_ratio < 0.12:
        return False

    if green_ratio >= 0.05 and vegetation_ratio >= 0.10:
        return True

    if earthy_ratio >= 0.35 and artificial_ratio < 0.10 and blue_mean <= 110 and 30 <= brightness <= 215:
        return True

    return False