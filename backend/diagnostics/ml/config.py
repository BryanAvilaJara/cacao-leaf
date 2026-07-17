from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "cacao_leaf_model.h5"
IMAGE_SIZE = (224, 224)
FEATURE_IMAGE_SIZE = (128, 128)
RANDOM_SEED = 42

CLASS_LABELS = {
    "healthy": "Hoja aparentemente sana",
    "pathology": "Posible patologia visible",
}

DATASET_DIR = BASE_DIR / "dataset"
RAW_DATASET_DIR = BASE_DIR / "raw" / "CocoaSwolSet"
