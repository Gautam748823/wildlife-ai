"""
scripts/data_preprocessing.py
================================
Prepares the wildlife dataset for training:
  1. Splits raw images into train/ and val/ folders (80/20 split)
  2. Runs augmentation to expand small classes to TARGET_MIN images
  3. Validates dataset health (min images per class, supported formats)

Usage:
    python scripts/data_preprocessing.py --source data/raw --train data/train --val data/val
"""

import os
import shutil
import random
import argparse
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance
import numpy as np

parser = argparse.ArgumentParser()
parser.add_argument("--source",     default="data/raw",   help="Folder with species sub-folders")
parser.add_argument("--train",      default="data/train", help="Output train folder")
parser.add_argument("--val",        default="data/val",   help="Output val folder")
parser.add_argument("--split",      type=float, default=0.8, help="Train/val ratio")
parser.add_argument("--target_min", type=int,   default=150, help="Min images per class after augmentation")
args = parser.parse_args()

SUPPORTED = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


# ── Augmentation helpers ──────────────────────────────────────────────────────
def augment(img: Image.Image) -> Image.Image:
    ops = [
        lambda i: i.transpose(Image.FLIP_LEFT_RIGHT),
        lambda i: i.rotate(random.uniform(-20, 20)),
        lambda i: ImageEnhance.Brightness(i).enhance(random.uniform(0.6, 1.4)),
        lambda i: ImageEnhance.Contrast(i).enhance(random.uniform(0.7, 1.4)),
        lambda i: i.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.5, 1.2))),
    ]
    for op in random.sample(ops, k=random.randint(2, 3)):
        img = op(img)
    return img


# ── Step 1: Train / Val split ─────────────────────────────────────────────────
def split_dataset():
    source = Path(args.source)
    if not source.exists():
        print(f"[Error] Source folder not found: {source}")
        return

    species_dirs = [d for d in source.iterdir() if d.is_dir()]
    print(f"\n[Split] Found {len(species_dirs)} species in {source}")

    for sp_dir in sorted(species_dirs):
        images = [p for p in sp_dir.iterdir() if p.suffix.lower() in SUPPORTED]
        random.shuffle(images)

        n_train = int(len(images) * args.split)
        splits  = {"train": images[:n_train], "val": images[n_train:]}

        for split_name, files in splits.items():
            out_dir = Path(args.train if split_name == "train" else args.val) / sp_dir.name
            out_dir.mkdir(parents=True, exist_ok=True)
            for f in files:
                shutil.copy2(f, out_dir / f.name)

        print(f"  [{sp_dir.name}] {len(splits['train'])} train  |  {len(splits['val'])} val")


# ── Step 2: Augment small classes ─────────────────────────────────────────────
def augment_dataset():
    train_path = Path(args.train)
    for sp_dir in sorted(train_path.iterdir()):
        if not sp_dir.is_dir():
            continue

        originals = [p for p in sp_dir.iterdir() if p.suffix.lower() in SUPPORTED and "_aug" not in p.name]
        current   = len(list(sp_dir.iterdir()))
        needed    = max(0, args.target_min - current)

        if needed == 0:
            print(f"[Augment] {sp_dir.name}: already has {current} images — OK")
            continue

        print(f"[Augment] {sp_dir.name}: generating {needed} augmented images...")
        gen, cycle = 0, 0
        while gen < needed:
            for orig in originals:
                if gen >= needed: break
                img = Image.open(orig).convert("RGB")
                aug = augment(img)
                aug.save(sp_dir / f"{orig.stem}_aug_{cycle}_{gen}{orig.suffix}", quality=90)
                gen += 1
            cycle += 1
        print(f"  ✅ Done — {sp_dir.name} now has {len(list(sp_dir.iterdir()))} images")


# ── Step 3: Validate ─────────────────────────────────────────────────────────
def validate_dataset():
    print("\n[Validate] Checking dataset health...")
    for split in [args.train, args.val]:
        p = Path(split)
        if not p.exists():
            print(f"  WARNING: {split} folder does not exist")
            continue
        for sp_dir in sorted(p.iterdir()):
            if not sp_dir.is_dir(): continue
            count = sum(1 for f in sp_dir.iterdir() if f.suffix.lower() in SUPPORTED)
            status = "✅" if count >= 30 else "⚠️ (needs more images)"
            print(f"  [{split.split('/')[-1]}] {sp_dir.name}: {count} images {status}")


if __name__ == "__main__":
    print("=== Wildlife AI — Data Preprocessing ===\n")
    split_dataset()
    augment_dataset()
    validate_dataset()
    print("\n[Done] Dataset ready for training!")
