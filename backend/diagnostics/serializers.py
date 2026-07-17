from rest_framework import serializers
from PIL import Image, ImageStat, UnidentifiedImageError

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


def looks_like_vegetation(image: Image.Image) -> bool:
    rgb_image = image.convert("RGB").resize((96, 96))
    pixels = list(rgb_image.getdata())
    if not pixels:
        return False

    stat = ImageStat.Stat(rgb_image)
    red, green, blue = stat.mean
    brightness = (red + green + blue) / 3

    green_pixels = 0
    natural_pixels = 0
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

        green_signal = green >= 55 and green >= red * 0.85 and green >= blue * 0.85
        brown_yellow_signal = red >= 55 and green >= 35 and blue <= max(red, green) * 0.82
        earthy_signal = red >= blue + 12 and green >= blue + 6 and saturation >= 18

        if green_signal:
            green_pixels += 1
        if green_signal or brown_yellow_signal or earthy_signal:
            natural_pixels += 1

    total = len(pixels)
    green_ratio = green_pixels / total
    natural_ratio = natural_pixels / total
    very_bright_ratio = very_bright_pixels / total
    very_dark_ratio = very_dark_pixels / total

    if very_bright_ratio > 0.78 or very_dark_ratio > 0.82:
        return False

    if green_ratio >= 0.08:
        return True

    if natural_ratio >= 0.18 and 35 <= brightness <= 220:
        return True

    return False
