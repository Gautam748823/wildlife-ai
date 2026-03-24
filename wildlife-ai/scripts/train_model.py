"""
scripts/train_model.py
========================
Fine-tunes ResNet50 or EfficientNet-B4 on the wildlife dataset.

Dataset structure expected:
    data/
      train/<SpeciesName>/*.jpg
      val/<SpeciesName>/*.jpg

Outputs:
    best_model.pth     — saved weights (highest val accuracy)
    class_names.json   — species list (used by classifier.py)

Usage:
    python scripts/train_model.py
    python scripts/train_model.py --arch efficientnet_b4 --epochs 30
"""

import os
import json
import copy
import argparse
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import models, transforms, datasets

# ── Args ──────────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser(description="Train Wildlife AI classifier")
parser.add_argument("--arch",       default="resnet50",  choices=["resnet50", "efficientnet_b4"])
parser.add_argument("--epochs",     type=int, default=20)
parser.add_argument("--batch",      type=int, default=32)
parser.add_argument("--lr",         type=float, default=0.001)
parser.add_argument("--workers",    type=int, default=0, help="DataLoader workers. Use 0 for low-resource laptops.")
parser.add_argument("--log-every",  type=int, default=20, help="Print batch progress every N training steps.")
parser.add_argument("--train_dir",  default="data/train")
parser.add_argument("--val_dir",    default="data/val")
parser.add_argument("--output",     default="best_model.pth")
args = parser.parse_args()

# ── Transforms ────────────────────────────────────────────────────────────────
train_tfm = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.3, contrast=0.3),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])
val_tfm = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


def build_model(arch, num_classes):
    if arch == "efficientnet_b4":
        m = models.efficientnet_b4(pretrained=True)
        for p in m.parameters(): p.requires_grad = False
        m.classifier[1] = nn.Linear(m.classifier[1].in_features, num_classes)
    else:
        m = models.resnet50(pretrained=True)
        for p in m.parameters(): p.requires_grad = False
        m.fc = nn.Linear(m.fc.in_features, num_classes)
        for p in m.layer4.parameters(): p.requires_grad = True
    return m


def main():
    # Load data
    train_ds = datasets.ImageFolder(args.train_dir, transform=train_tfm)
    val_ds   = datasets.ImageFolder(args.val_dir,   transform=val_tfm)
    train_dl = DataLoader(train_ds, batch_size=args.batch, shuffle=True,  num_workers=args.workers)
    val_dl   = DataLoader(val_ds,   batch_size=args.batch, shuffle=False, num_workers=args.workers)

    class_names = train_ds.classes
    print(f"[Train] {len(class_names)} classes: {class_names}")
    with open("class_names.json", "w") as f:
        json.dump(class_names, f, indent=2)

    # Build model
    model  = build_model(args.arch, len(class_names))
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model  = model.to(device)
    print(f"[Train] Architecture: {args.arch} | Device: {device}")
    print(f"[Train] DataLoader workers: {args.workers} | Batch size: {args.batch}")

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=args.lr)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=7, gamma=0.1)

    best_acc, best_weights = 0.0, None

    for epoch in range(1, args.epochs + 1):
        # Train
        model.train()
        loss_sum, correct = 0.0, 0
        total_steps = len(train_dl)
        for step, (imgs, labels) in enumerate(train_dl, start=1):
            imgs, labels = imgs.to(device), labels.to(device)
            optimizer.zero_grad()
            out  = model(imgs)
            loss = criterion(out, labels)
            loss.backward()
            optimizer.step()
            loss_sum += loss.item() * imgs.size(0)
            correct  += (out.argmax(1) == labels).sum().item()

            if step % args.log_every == 0 or step == total_steps:
                print(
                    f"  Epoch {epoch:02d}/{args.epochs} | "
                    f"Step {step:03d}/{total_steps:03d} | "
                    f"Batch Loss: {loss.item():.4f}"
                )

        # Validate
        model.eval()
        val_correct = 0
        with torch.no_grad():
            for imgs, labels in val_dl:
                imgs, labels = imgs.to(device), labels.to(device)
                val_correct += (model(imgs).argmax(1) == labels).sum().item()

        train_acc = 100 * correct     / len(train_ds)
        val_acc   = 100 * val_correct / len(val_ds)
        print(f"Epoch {epoch:02d}/{args.epochs}  Loss: {loss_sum/len(train_ds):.4f}  "
              f"Train: {train_acc:.2f}%  Val: {val_acc:.2f}%")

        if val_acc > best_acc:
            best_acc     = val_acc
            best_weights = copy.deepcopy(model.state_dict())
            torch.save(best_weights, args.output)
            print(f"  ✅ Best model saved — Val Acc: {val_acc:.2f}%")

        scheduler.step()

    print(f"\n[Train] Done! Best val accuracy: {best_acc:.2f}% → {args.output}")


if __name__ == "__main__":
    main()
