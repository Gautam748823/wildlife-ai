"""
Apply image augmentation and save generated images per class.

Expected input structure:
    data/train/<class_name>/*.jpg

Usage:
    python scripts/augment.py
    python scripts/augment.py --input-dir data/train --multiplier 1 --max-per-class 500
"""

import argparse
import random
from pathlib import Path

from PIL import Image
import numpy as np
import cv2

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Augment training images.")
    parser.add_argument("--input-dir", default="data/train", help="Root train folder with class subfolders.")
    parser.add_argument(
        "--multiplier",
        type=int,
        default=1,
        help="How many augmented images to create per original image.",
    )
    parser.add_argument(
        "--max-per-class",
        type=int,
        default=0,
        help="Optional cap for total images per class after augmentation (0 disables cap).",
    )
    parser.add_argument("--seed", type=int, default=42, help="Random seed.")
    return parser.parse_args()


def list_images(folder: Path):
    return [p for p in folder.iterdir() if p.is_file() and p.suffix.lower() in VALID_EXTENSIONS and "_aug_" not in p.stem]


def random_flip(img: np.ndarray) -> np.ndarray:
    if random.random() < 0.5:
        return cv2.flip(img, 1)
    return img


def random_rotation(img: np.ndarray) -> np.ndarray:
    angle = random.uniform(-20, 20)
    h, w = img.shape[:2]
    matrix = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)
    return cv2.warpAffine(img, matrix, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)


def random_brightness(img: np.ndarray) -> np.ndarray:
    factor = random.uniform(0.75, 1.25)
    hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[:, :, 2] = np.clip(hsv[:, :, 2] * factor, 0, 255)
    return cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB)


def random_noise(img: np.ndarray) -> np.ndarray:
    std = random.uniform(5, 20)
    noise = np.random.normal(0, std, img.shape).astype(np.float32)
    out = img.astype(np.float32) + noise
    return np.clip(out, 0, 255).astype(np.uint8)


def random_zoom(img: np.ndarray) -> np.ndarray:
    h, w = img.shape[:2]
    zoom = random.uniform(1.0, 1.2)

    nh = int(h / zoom)
    nw = int(w / zoom)
    y1 = random.randint(0, max(0, h - nh))
    x1 = random.randint(0, max(0, w - nw))

    cropped = img[y1 : y1 + nh, x1 : x1 + nw]
    return cv2.resize(cropped, (w, h), interpolation=cv2.INTER_LINEAR)


def augment_once(img: np.ndarray) -> np.ndarray:
    ops = [random_flip, random_rotation, random_brightness, random_noise, random_zoom]
    random.shuffle(ops)
    num_ops = random.randint(2, 5)

    out = img.copy()
    for op in ops[:num_ops]:
        out = op(out)
    return out


def save_augmented(original_path: Path, output_image: np.ndarray, aug_idx: int) -> None:
    output_name = f"{original_path.stem}_aug_{aug_idx}{original_path.suffix.lower()}"
    Image.fromarray(output_image).save(original_path.parent / output_name, quality=95)


def main() -> None:
    args = parse_args()
    random.seed(args.seed)
    np.random.seed(args.seed)

    input_dir = Path(args.input_dir)
    if not input_dir.exists():
        raise FileNotFoundError(f"Input folder not found: {input_dir}")

    class_dirs = sorted([d for d in input_dir.iterdir() if d.is_dir()])
    if not class_dirs:
        raise RuntimeError(f"No class folders found in {input_dir}")

    print(f"Found {len(class_dirs)} classes in {input_dir}")

    for class_dir in class_dirs:
        originals = list_images(class_dir)
        if not originals:
            print(f"[{class_dir.name}] skipped (no images)")
            continue

        existing_count = len([p for p in class_dir.iterdir() if p.is_file() and p.suffix.lower() in VALID_EXTENSIONS])

        generated = 0
        aug_idx = 0
        for image_path in originals:
            if args.max_per_class > 0 and (existing_count + generated) >= args.max_per_class:
                break

            rgb = np.array(Image.open(image_path).convert("RGB"))
            for _ in range(args.multiplier):
                if args.max_per_class > 0 and (existing_count + generated) >= args.max_per_class:
                    break

                aug_img = augment_once(rgb)
                save_augmented(image_path, aug_img, aug_idx)
                generated += 1
                aug_idx += 1

        print(
            f"[{class_dir.name}] originals={len(originals)} generated={generated} total={existing_count + generated}"
        )

    print("\nAugmentation complete")


if __name__ == "__main__":
    main()
