"""
backend/models/detector.py
============================
YOLOv8 animal detector — locates animals with bounding boxes.

Usage:
    from backend.models.detector import AnimalDetector
    det = AnimalDetector()
    result = det.detect_bytes(image_bytes)
    # → {"detections": [{"label": "tiger", "confidence": 0.91, "bbox": [x1,y1,x2,y2]}]}
"""

import io


class AnimalDetector:
    """Wraps YOLOv8 for real-time animal detection."""

    def __init__(self, model_size: str = "yolov8n.pt"):
        """
        model_size options (speed vs accuracy):
          yolov8n.pt  — nano  (fastest, lowest accuracy)
          yolov8s.pt  — small
          yolov8m.pt  — medium
          yolov8l.pt  — large
          yolov8x.pt  — extra large (slowest, highest accuracy)
        """
        try:
            from ultralytics import YOLO
            self.model = YOLO(model_size)
            print(f"[Detector] YOLOv8 loaded: {model_size}")
        except ImportError:
            print("[Detector] ultralytics not installed — run: pip install ultralytics")
            self.model = None

    def detect_bytes(self, image_bytes: bytes, threshold: float = 0.4) -> dict:
        """Detect animals in raw image bytes."""
        if not self.model:
            return {"error": "YOLOv8 not installed", "detections": []}

        from PIL import Image
        image   = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        results = self.model(image, conf=threshold)

        detections = [
            {
                "label":      result.names[int(box.cls)],
                "confidence": round(float(box.conf), 4),
                "bbox":       [round(float(c), 2) for c in box.xyxy[0].tolist()],
            }
            for result in results
            for box in result.boxes
        ]

        return {"detections": detections, "total": len(detections)}
