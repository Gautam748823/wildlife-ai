"""
Validate dataset quality for classification training.

Checks:
1. Count images per class in train and val
2. Detect corrupted/unreadable images
3. Print dataset-level statistics

Usage:
    python scripts/validate_dataset.py
    python scripts/validate_dataset.py --train-dir data/train --val-dir data/val
"""

import argparse
from pathlib import Path
from typing import Dict, List, Tuple

from PIL import Image

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate image dataset.")
    parser.add_argument("--train-dir", default="data/train", help="Train directory")
    parser.add_argument("--val-dir", default="data/val", help="Validation directory")
    return parser.parse_args()


def class_counts(root: Path) -> Dict[str, int]:
    counts: Dict[str, int] = {}
    if not root.exists():
        return counts

    for class_dir in sorted([d for d in root.iterdir() if d.is_dir()]):
        count = sum(
            1
            for p in class_dir.iterdir()
            if p.is_file() and p.suffix.lower() in VALID_EXTENSIONS
        )
        counts[class_dir.name] = count
    return counts


def find_corrupted_images(root: Path) -> List[Tuple[str, str]]:
    corrupted: List[Tuple[str, str]] = []
    if not root.exists():
        return corrupted

    for class_dir in sorted([d for d in root.iterdir() if d.is_dir()]):
        for image_path in class_dir.iterdir():
            if not image_path.is_file() or image_path.suffix.lower() not in VALID_EXTENSIONS:
                continue
            try:
                with Image.open(image_path) as img:
                    img.verify()
            except Exception as exc:  # noqa: BLE001
                corrupted.append((str(image_path), str(exc)))
    return corrupted


def summarize(name: str, counts: Dict[str, int]) -> None:
    if not counts:
        print(f"{name}: directory missing or empty")
        return

    total = sum(counts.values())
    print(f"\n{name} summary")
    print(f"Classes: {len(counts)}")
    print(f"Images:  {total}")

    for class_name, count in counts.items():
        print(f"  - {class_name}: {count}")


def main() -> None:
    args = parse_args()

    train_dir = Path(args.train_dir)
    val_dir = Path(args.val_dir)

    train_counts = class_counts(train_dir)
    val_counts = class_counts(val_dir)

    summarize("Train", train_counts)
    summarize("Val", val_counts)

    train_corrupted = find_corrupted_images(train_dir)
    val_corrupted = find_corrupted_images(val_dir)
    all_corrupted = train_corrupted + val_corrupted

    print("\nValidation report")
    print(f"Corrupted images: {len(all_corrupted)}")

    if all_corrupted:
        print("Sample corrupted files:")
        for path, err in all_corrupted[:20]:
            print(f"  - {path} | error: {err}")

    total_train = sum(train_counts.values())
    total_val = sum(val_counts.values())
    total = total_train + total_val

    print("\nDataset totals")
    print(f"Train images: {total_train}")
    print(f"Val images:   {total_val}")
    print(f"All images:   {total}")


if __name__ == "__main__":
    main()
