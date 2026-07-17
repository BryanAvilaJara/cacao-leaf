import argparse
import random
import zipfile
from pathlib import Path

from PIL import Image, UnidentifiedImageError

from .config import DATASET_DIR, RAW_DATASET_DIR, RANDOM_SEED


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
SPLITS = {"train": 0.7, "val": 0.15, "test": 0.15}


def _label_from_path(path: str) -> str | None:
    normalized = path.lower().replace("\\", "/")
    if "/leaves/" not in normalized:
        return None
    if "/healthy/" in normalized:
        return "healthy"
    if "/diseased/" in normalized or "/diseaded/" in normalized:
        return "pathology"
    return None


def _copy_as_jpeg(source, destination: Path) -> bool:
    destination.parent.mkdir(parents=True, exist_ok=True)
    try:
        with Image.open(source) as image:
            image.convert("RGB").save(destination, format="JPEG", quality=88)
        return True
    except (UnidentifiedImageError, OSError):
        return False


def _clear_dataset_dirs() -> None:
    for split in SPLITS:
        for label in ("healthy", "pathology"):
            target = DATASET_DIR / split / label
            target.mkdir(parents=True, exist_ok=True)
            for file in target.glob("*.jpg"):
                file.unlink()


def prepare_from_zip(zip_path: Path, max_per_class: int | None) -> dict[str, int]:
    grouped: dict[str, list[zipfile.ZipInfo]] = {"healthy": [], "pathology": []}

    with zipfile.ZipFile(zip_path) as archive:
        for item in archive.infolist():
            if item.is_dir() or Path(item.filename).suffix.lower() not in IMAGE_EXTENSIONS:
                continue
            label = _label_from_path(item.filename)
            if label:
                grouped[label].append(item)

        return _write_split_from_archive(archive, grouped, max_per_class)


def prepare_from_folder(source_dir: Path, max_per_class: int | None) -> dict[str, int]:
    grouped: dict[str, list[Path]] = {"healthy": [], "pathology": []}
    for item in source_dir.rglob("*"):
        if item.is_file() and item.suffix.lower() in IMAGE_EXTENSIONS:
            label = _label_from_path(str(item))
            if label:
                grouped[label].append(item)

    return _write_split_from_folder(grouped, max_per_class)


def _limit_and_shuffle(items, max_per_class):
    random.shuffle(items)
    return items[:max_per_class] if max_per_class else items


def _split_items(items):
    total = len(items)
    train_end = int(total * SPLITS["train"])
    val_end = train_end + int(total * SPLITS["val"])
    return {
        "train": items[:train_end],
        "val": items[train_end:val_end],
        "test": items[val_end:],
    }


def _write_split_from_archive(archive, grouped, max_per_class):
    _clear_dataset_dirs()
    random.seed(RANDOM_SEED)
    counts = {"healthy": 0, "pathology": 0}

    for label, items in grouped.items():
        selected = _limit_and_shuffle(items, max_per_class)
        for split, split_items in _split_items(selected).items():
            for index, item in enumerate(split_items, start=1):
                target = DATASET_DIR / split / label / f"{label}_{index:05d}.jpg"
                with archive.open(item) as source:
                    if _copy_as_jpeg(source, target):
                        counts[label] += 1

    return counts


def _write_split_from_folder(grouped, max_per_class):
    _clear_dataset_dirs()
    random.seed(RANDOM_SEED)
    counts = {"healthy": 0, "pathology": 0}

    for label, items in grouped.items():
        selected = _limit_and_shuffle(items, max_per_class)
        for split, split_items in _split_items(selected).items():
            for index, item in enumerate(split_items, start=1):
                target = DATASET_DIR / split / label / f"{label}_{index:05d}.jpg"
                if _copy_as_jpeg(item, target):
                    counts[label] += 1

    return counts


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--zip", type=Path, default=RAW_DATASET_DIR.with_suffix(".zip"))
    parser.add_argument("--folder", type=Path, default=None)
    parser.add_argument("--max-per-class", type=int, default=300)
    args = parser.parse_args()

    if args.folder:
        counts = prepare_from_folder(args.folder, args.max_per_class)
    else:
        counts = prepare_from_zip(args.zip, args.max_per_class)

    print(f"Dataset preparado en {DATASET_DIR}")
    print(f"healthy={counts['healthy']} pathology={counts['pathology']}")


if __name__ == "__main__":
    main()
