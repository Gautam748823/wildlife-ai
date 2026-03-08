# 🦁 Generative AI for Wildlife Conservation & Species Identification

An AI-powered full-stack system to identify wildlife species from images, generate conservation reports, and monitor animal populations through a research dashboard.

---

## 🏗️ Architecture Overview

```
React Frontend (Vite)  ←→  FastAPI Python Backend  ←→  Node.js Firestore Service
                                    ↓                           ↓
                            Cloudinary (images)          Google Firestore (data)
                                    ↓
                         AI Models (ResNet50 / YOLOv8)
                                    ↓
                         Generative AI (Claude / GPT)
```

---

## 📁 Project Structure

```
wildlife-ai/
├── backend/                     Python FastAPI backend
│   ├── main.py                  FastAPI app — all routes
│   ├── api/routes.py            Additional API endpoints
│   ├── models/
│   │   ├── classifier.py        ResNet50/EfficientNet species classifier
│   │   └── detector.py          YOLOv8 animal detector
│   └── utils/
│       ├── cloudinary_upload.py Upload images to Cloudinary
│       └── report_generator.py  Generate reports via Claude/GPT
│
├── node-service/                Node.js Firestore microservice
│   ├── server.js                Express server (port 5001)
│   ├── firestore.js             Firebase Admin SDK init
│   ├── routes/
│   │   ├── sightings.js         CRUD for sightings collection
│   │   └── species.js           CRUD for species collection
│   └── package.json
│
├── frontend/                    React.js (Vite) frontend
│   ├── src/
│   │   ├── App.jsx              Root component + routing
│   │   ├── main.jsx             React DOM entry point
│   │   ├── pages/
│   │   │   ├── Upload.jsx       Image upload + identify page
│   │   │   ├── Results.jsx      Species results display
│   │   │   └── Dashboard.jsx    Research dashboard
│   │   ├── components/
│   │   │   ├── SightingsTable.jsx   Reusable table
│   │   │   └── UploadCard.jsx       Reusable upload card
│   │   ├── hooks/
│   │   │   └── useSightings.js  Custom hook for data fetching
│   │   └── styles/main.css      Global CSS reset
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── scripts/
│   ├── train_model.py           ResNet50/EfficientNet training
│   └── data_preprocessing.py   Dataset split + augmentation
│
├── config/
│   ├── cloudinary_config.js     Cloudinary setup reference
│   └── firestore_config.js      Firestore setup guide
│
├── data/
│   ├── train/                   Training images (git-ignored)
│   ├── val/                     Validation images (git-ignored)
│   └── uploads/                 Temp uploads (git-ignored)
│
├── class_names.json             Species list for AI model
├── requirements.txt             Python dependencies
├── package.json                 Root npm scripts
├── .env.example                 Environment variables template
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### 1. Clone & Set Up

```bash
git clone https://github.com/raz-88/wildlife-ai.git
cd wildlife-ai
cp .env.example .env
# Open .env and fill in all credentials
```

### 2. Python Backend

```bash
python -m venv wildlife_env
source wildlife_env/bin/activate        # Windows: wildlife_env\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

### 3. Node.js Firestore Service

```bash
cd node-service
npm install
node server.js
# Runs on http://localhost:5001
```

### 4. React Frontend

```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:3000
```

---

## 🔑 Required API Keys & Services

| Service | What it does | Get it from |
|---|---|---|
| Cloudinary | Stores uploaded wildlife images | cloudinary.com (free) |
| Firebase/Firestore | Database for sightings & species | console.firebase.google.com (free) |
| Anthropic Claude | Generates wildlife reports | console.anthropic.com |
| OpenAI GPT | Fallback report generation | platform.openai.com |

---

## 🧠 AI Models

| Model | Task |
|---|---|
| ResNet50 (fine-tuned) | Species classification — what animal is this? |
| EfficientNet-B4 | Alternative classifier — higher accuracy |
| YOLOv8 | Animal detection — where is the animal in the image? |

### Training Your Model

```bash
# 1. Organise dataset into data/train/<species>/ and data/val/<species>/
# 2. (Optional) Run preprocessing and augmentation:
python scripts/data_preprocessing.py
# 3. Train:
python scripts/train_model.py --arch resnet50 --epochs 20
# Output: best_model.pth + class_names.json
```

---

## 🗃️ Datasets

| Dataset | Link | Best For |
|---|---|---|
| iNaturalist | kaggle.com/datasets | Large-scale species classification |
| COCO Animals | cocodataset.org | Detection with bounding boxes |
| Wildlife Insights | wildlifeinsights.org | Camera trap images |
| Kaggle Animal-10 | kaggle.com | Beginner — 10 common species |

---

## 🌿 Git Workflow (Collaborative)

```bash
git checkout project-structure    # Switch to your branch
git add .
git commit -m "feat: add complete project structure"
git push origin project-structure
# Then open a Pull Request on GitHub → main
```

---

## 📄 License
MIT — free to use for conservation and research.
