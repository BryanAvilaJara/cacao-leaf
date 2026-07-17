from pathlib import Path

import h5py
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler

from .config import DATASET_DIR, MODEL_PATH
from .preprocessing import extract_features


LABEL_TO_INT = {"healthy": 0, "pathology": 1}


def _load_split(split: str):
    features = []
    labels = []
    for label, numeric_label in LABEL_TO_INT.items():
        folder = DATASET_DIR / split / label
        for image_path in sorted(folder.glob("*.jpg")):
            with image_path.open("rb") as image_file:
                features.append(extract_features(image_file))
                labels.append(numeric_label)

    if not features:
        raise RuntimeError(f"No hay imagenes en {DATASET_DIR / split}")

    return np.vstack(features), np.asarray(labels, dtype=np.int64)


def _save_model(model: LogisticRegression, scaler: StandardScaler, test_accuracy: float) -> None:
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with h5py.File(MODEL_PATH, "w") as model_file:
        model_file.create_dataset("coef", data=model.coef_.astype(np.float32))
        model_file.create_dataset("intercept", data=model.intercept_.astype(np.float32))
        model_file.create_dataset("mean", data=scaler.mean_.astype(np.float32))
        model_file.create_dataset("scale", data=scaler.scale_.astype(np.float32))
        model_file.create_dataset(
            "classes",
            data=np.asarray(["healthy", "pathology"], dtype=h5py.string_dtype("utf-8")),
        )
        model_file.attrs["test_accuracy"] = float(test_accuracy)
        model_file.attrs["model_type"] = "logistic_regression_image_features"
        model_file.attrs["dataset"] = "CocoaSwolSet Leaves"


def main():
    x_train, y_train = _load_split("train")
    x_val, y_val = _load_split("val")
    x_test, y_test = _load_split("test")

    scaler = StandardScaler()
    x_train_scaled = scaler.fit_transform(x_train)
    x_val_scaled = scaler.transform(x_val)
    x_test_scaled = scaler.transform(x_test)

    model = LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)
    model.fit(np.vstack([x_train_scaled, x_val_scaled]), np.concatenate([y_train, y_val]))

    predictions = model.predict(x_test_scaled)
    test_accuracy = accuracy_score(y_test, predictions)
    _save_model(model, scaler, test_accuracy)

    print(f"Modelo guardado en {MODEL_PATH}")
    print(f"Accuracy test: {test_accuracy:.4f}")
    print(classification_report(y_test, predictions, target_names=["healthy", "pathology"]))


if __name__ == "__main__":
    main()
