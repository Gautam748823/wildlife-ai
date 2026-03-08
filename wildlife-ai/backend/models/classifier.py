"""
backend/models/classifier.py
==============================
ResNet50 / EfficientNet species classifier.
Loads trained weights and runs inference on uploaded wildlife images.

Usage:
    from backend.models.classifier import SpeciesClassifier
    clf = SpeciesClassifier("best_model.pth", "class_names.json")
    results = clf.predict_bytes(image_bytes)
    # → [{"species": "Bengal Tiger", "confidence": 94.3}, ...]
"""

import io
import json
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image


# ImageNet normalisation values (used by all torchvision pre-trained models)
PREPROCESS = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


class SpeciesClassifier:
    """Wraps ResNet50 fine-tuned on wildlife datasets."""

    def __init__(self, model_path: str, class_names_path: str, architecture: str = "resnet50"):
        """
        Args:
            model_path:       Path to .pth weights file
            class_names_path: Path to class_names.json
            architecture:     'resnet50' or 'efficientnet_b4'
        """
        with open(class_names_path) as f:
            self.class_names = json.load(f)

        num_classes = len(self.class_names)

        # Build backbone
        if architecture == "efficientnet_b4":
            self.model = models.efficientnet_b4(pretrained=False)
            self.model.classifier[1] = nn.Linear(
                self.model.classifier[1].in_features, num_classes
            )
        else:  # default resnet50
            self.model = models.resnet50(pretrained=False)
            self.model.fc = nn.Linear(self.model.fc.in_features, num_classes)

        self.model.load_state_dict(torch.load(model_path, map_location="cpu"))
        self.model.eval()

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model  = self.model.to(self.device)

        print(f"[Classifier] Loaded — {num_classes} species, device={self.device}")

    def predict_bytes(self, image_bytes: bytes, top_k: int = 5) -> list[dict]:
        """Run inference on raw image bytes (from UploadFile.read())."""
        image  = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = PREPROCESS(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            probs = torch.softmax(self.model(tensor), dim=1)[0]
            top   = torch.topk(probs, min(top_k, len(self.class_names)))

        return [
            {"species": self.class_names[i.item()], "confidence": round(p.item() * 100, 2)}
            for p, i in zip(top.values, top.indices)
        ]
