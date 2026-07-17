from pathlib import Path

import h5py
import numpy as np

from .config import MODEL_PATH


def trained_model_available(model_path: Path = MODEL_PATH) -> bool:
    return model_path.exists()


def load_model():
    if not trained_model_available():
        return None

    with h5py.File(MODEL_PATH, "r") as model_file:
        return {
            "coef": np.asarray(model_file["coef"]),
            "intercept": float(np.asarray(model_file["intercept"])[0]),
            "mean": np.asarray(model_file["mean"]),
            "scale": np.asarray(model_file["scale"]),
            "classes": [item.decode("utf-8") for item in np.asarray(model_file["classes"])],
            "accuracy": float(model_file.attrs.get("test_accuracy", 0.0)),
        }
