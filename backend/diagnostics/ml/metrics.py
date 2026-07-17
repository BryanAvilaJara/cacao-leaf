import h5py

from .config import MODEL_PATH


def get_saved_test_accuracy() -> float | None:
    if not MODEL_PATH.exists():
        return None

    with h5py.File(MODEL_PATH, "r") as model_file:
        return float(model_file.attrs.get("test_accuracy", 0.0))
