from diagnostics.types import ClassificationResult

from .model_loader import load_model
from .preprocessing import extract_features


def predict_with_trained_model(_image_file) -> ClassificationResult | None:
    model = load_model()
    if model is None:
        return None

    features = extract_features(_image_file)
    scaled = (features - model["mean"]) / model["scale"]
    score = float(scaled @ model["coef"].ravel() + model["intercept"])
    pathology_probability = 1.0 / (1.0 + __import__("math").exp(-score))

    if pathology_probability >= 0.5:
        confidence = pathology_probability * 100
        return ClassificationResult(
            status="pathology",
            confidence=confidence,
            disease_label="Posible patologia visible",
            recommendation=(
                "Revisa la planta con mayor detalle y consulta a un especialista agricola "
                "antes de aplicar tratamientos."
            ),
            notes="La imagen presenta senales visuales que podrian estar asociadas a una patologia.",
        )

    confidence = (1.0 - pathology_probability) * 100
    return ClassificationResult(
        status="healthy",
        confidence=confidence,
        disease_label="Hoja aparentemente sana",
        recommendation=(
            "Mantener monitoreo preventivo y registrar nuevas fotos si aparecen manchas, "
            "amarillamiento o cambios visibles."
        ),
        notes="No se observan senales visuales relevantes en la imagen analizada.",
    )
