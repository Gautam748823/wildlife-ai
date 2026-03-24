"""
Prepare classification dataset split from a raw class-folder dataset.

Expected source structure:
    data/raw/<class_name>/*.jpg

Output structure:
    data/train/<class_name>/*
    data/val/<class_name>/*

Usage:
    python scripts/prepare_dataset.py
    python scripts/prepare_dataset.py --source data/inaturalist_subset --train-ratio 0.8 --seed 42
"""

import argparse
import random
import shutil
from pathlib import Path
from typing import Dict, List

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Split dataset into train/val folders.")
    parser.add_argument("--source", default="data/raw", help="Root folder with one subfolder per class.")
    parser.add_argument("--train-dir", default="data/train", help="Output train folder.")
    parser.add_argument("--val-dir", default="data/val", help="Output validation folder.")
    parser.add_argument("--train-ratio", type=float, default=0.8, help="Train split ratio between 0 and 1.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for deterministic splits.")
    parser.add_argument(
        "--clear-output",
        action="store_true",
        help="Delete and recreate train/val directories before copying.",
    )
    return parser.parse_args()


def list_images(folder: Path) -> List[Path]:
    return [p for p in folder.iterdir() if p.is_file() and p.suffix.lower() in VALID_EXTENSIONS]


def ensure_clean_dir(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)


def copy_split(images: List[Path], output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for img_path in images:
        shutil.copy2(img_path, output_dir / img_path.name)


def split_class_images(images: List[Path], train_ratio: float) -> Dict[str, List[Path]]:
    total = len(images)
    if total == 0:
        return {"train": [], "val": []}

    train_count = int(total * train_ratio)
    if total > 1:
        train_count = max(1, min(train_count, total - 1))

    return {"train": images[:train_count], "val": images[train_count:]}


def main() -> None:
    args = parse_args()

    if not (0.0 < args.train_ratio < 1.0):
        raise ValueError("--train-ratio must be between 0 and 1 (exclusive).")

    source_dir = Path(args.source)
    train_dir = Path(args.train_dir)
    val_dir = Path(args.val_dir)

    if not source_dir.exists() or not source_dir.is_dir():
        raise FileNotFoundError(f"Source folder not found: {source_dir}")

    random.seed(args.seed)

    if args.clear_output:
        ensure_clean_dir(train_dir)
        ensure_clean_dir(val_dir)
    else:
        train_dir.mkdir(parents=True, exist_ok=True)
        val_dir.mkdir(parents=True, exist_ok=True)

    class_dirs = sorted([d for d in source_dir.iterdir() if d.is_dir()])
    if not class_dirs:
        raise RuntimeError(f"No class folders found under {source_dir}")

    print(f"Found {len(class_dirs)} classes in {source_dir}")

    total_train = 0
    total_val = 0

    for class_dir in class_dirs:
        class_name = class_dir.name
        images = list_images(class_dir)
        random.shuffle(images)

        split = split_class_images(images, args.train_ratio)

        copy_split(split["train"], train_dir / class_name)
        copy_split(split["val"], val_dir / class_name)

        n_train = len(split["train"])
        n_val = len(split["val"])
        total_train += n_train
        total_val += n_val

        print(f"[{class_name}] train={n_train} val={n_val} total={len(images)}")

    print("\nSplit complete")
    print(f"Train images: {total_train}")
    print(f"Val images:   {total_val}")


if __name__ == "__main__":
    main()
