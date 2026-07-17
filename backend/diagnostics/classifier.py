from PIL import Image, ImageStat

from .ml.inference import predict_with_trained_model
from .types import ClassificationResult


def classify_cacao_leaf(image_file) -> ClassificationResult:
    """Prototype classifier.

    This is a deterministic image heuristic used until a trained ML model is
    available. The API contract is intentionally model-like so it can later be
    replaced by TensorFlow, PyTorch, ONNX, or an external inference service.
    """
    trained_result = predict_with_trained_model(image_file)
    if trained_result is not None:
        return trained_result

    image_file.seek(0)
    with Image.open(image_file) as image:
        rgb_image = image.convert("RGB").resize((96, 96))
        stat = ImageStat.Stat(rgb_image)
        red, green, blue = stat.mean

    image_file.seek(0)

    green_dominance = green - ((red + blue) / 2)
    brown_signal = red - blue
    brightness = (red + green + blue) / 3

    if green_dominance >= 18 and brightness >= 75:
        return ClassificationResult(
            status="healthy",
            confidence=min(96.0, 72.0 + green_dominance / 2),
            disease_label="Hoja aparentemente sana",
            recommendation=(
                "Clasificacion preliminar: mantener monitoreo preventivo y registrar nuevas fotos si "
                "aparecen manchas, amarillamiento o necrosis."
            ),
            notes="Resultado preliminar: predominan tonos verdes compatibles con una hoja sin sintomas visibles severos.",
        )

    confidence = min(94.0, 63.0 + abs(brown_signal) / 3 + max(0, 90 - brightness) / 4)
    return ClassificationResult(
        status="pathology",
        confidence=confidence,
        disease_label="Posible patologia visible",
        recommendation=(
            "Clasificacion preliminar: revisar la planta con un tecnico agricola, aislar muestras si el "
            "sintoma se repite y evitar aplicar tratamientos sin diagnostico profesional."
        ),
        notes="Resultado preliminar: la imagen presenta baja dominancia verde o tonos compatibles con manchas visibles.",
    )
