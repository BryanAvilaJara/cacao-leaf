import numpy as np
from PIL import Image
import colorsys

from .config import FEATURE_IMAGE_SIZE, IMAGE_SIZE


def prepare_image(image_file) -> Image.Image:
    image_file.seek(0)
    image = Image.open(image_file).convert("RGB")
    prepared = image.resize(IMAGE_SIZE)
    image_file.seek(0)
    return prepared


def extract_features(image_file) -> np.ndarray:
    image_file.seek(0)
    with Image.open(image_file) as image:
        image = image.convert("RGB").resize(FEATURE_IMAGE_SIZE)
        pixels = np.asarray(image, dtype=np.float32) / 255.0

    image_file.seek(0)

    channel_means = pixels.mean(axis=(0, 1))
    channel_stds = pixels.std(axis=(0, 1))
    histograms = [
        np.histogram(pixels[:, :, channel], bins=16, range=(0.0, 1.0), density=True)[0]
        for channel in range(3)
    ]
    flat_rgb = pixels.reshape(-1, 3)
    hsv = np.asarray([colorsys.rgb_to_hsv(*pixel) for pixel in flat_rgb], dtype=np.float32)
    hsv_means = hsv.mean(axis=0)
    hsv_stds = hsv.std(axis=0)
    hsv_histograms = [
        np.histogram(hsv[:, channel], bins=16, range=(0.0, 1.0), density=True)[0]
        for channel in range(3)
    ]

    red = pixels[:, :, 0]
    green = pixels[:, :, 1]
    blue = pixels[:, :, 2]
    vegetation_indexes = np.asarray(
        [
            np.mean(2 * green - red - blue),
            np.mean(green - red),
            np.mean(green - blue),
            np.mean(red - blue),
            np.mean((green - red) / (green + red + 1e-6)),
            np.mean(np.max(pixels, axis=2) - np.min(pixels, axis=2)),
        ],
        dtype=np.float32,
    )

    return np.concatenate(
        [
            channel_means,
            channel_stds,
            *histograms,
            hsv_means,
            hsv_stds,
            *hsv_histograms,
            vegetation_indexes,
        ]
    ).astype(np.float32)
