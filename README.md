# 🌾 Smart Agro Farms — Real-Time Farm Monitoring & Advisory System

> A web-based geospatial decision-support platform for Pakistani farmers, integrating Sentinel-2 satellite imagery, AI object detection, PostGIS spatial analysis, and automated advisory generation.

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Requirements](#system-requirements)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [User Roles & Access](#user-roles--access)
- [Frontend Pages](#frontend-pages)
- [SAM AI Object Detection](#sam-ai-object-detection)
- [GeoServer Integration](#geoserver-integration)
- [Project Structure](#project-structure)
- [Team](#team)

---

## Overview

**Smart Agro Farms** is a real-time farm monitoring and advisory system (RFMAS) built to modernize agricultural decision-making in Pakistan. It integrates:

- **Sentinel-2 satellite imagery** via Sentinel Hub OAuth API
- **Vegetation indices** (NDVI, NDMI, SAVI, MSAVI, NDRE)
- **Segment Anything Model (SAM ViT)** for AI-based field boundary detection
- **PostGIS spatial database** for LULC, agro-ecological zones, and crop layers
- **GeoServer** (Docker-based) for tile-based WMS layer serving
- **OpenWeather API** for 16-day weather forecasting
- **Django REST Framework** backend with Token-based authentication

---

## System Architecture

The system follows a **Three-Tier Architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                        │
│      HTML/CSS/JS Dashboard  ·  Leaflet.js GIS Maps         │
│      Chart.js Graphs  ·  Bootstrap UI Components           │
└────────────────────────┬────────────────────────────────────┘
                         │ Fetch API / REST
┌────────────────────────▼────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│   Django Backend  ·  Django REST Framework  ·  SAM ViT-L   │
│   Sentinel Hub API  ·  OpenWeather API  ·  GeoServer WMS   │
│   Rasterio / Mercantile  ·  GeoPandas  ·  Shapely          │
└────────────────────────┬────────────────────────────────────┘
                         │ psycopg2 / SQLAlchemy
┌────────────────────────▼────────────────────────────────────┐
│                      DATA LAYER                             │
│   PostgreSQL + PostGIS  ·  Spatial Tables (LULC, Zones,    │
│   Wheat, Sugarcane, Cotton)  ·  Media Files (GeoTIFF, SAM) │
└─────────────────────────────────────────────────────────────┘
```

---

## Features

### 🛰️ Satellite & Vegetation Analysis
- Fetches OAuth2 tokens from Sentinel Hub automatically (auto-expires after 45 minutes)
- Downloads and merges Google TMS satellite tiles into GeoTIFF at zoom level 19
- Runs SAM ViT-L model to auto-detect field boundaries, forests, and structures
- Outputs `masks.tif`, `masks.gpkg`, `masks.geojson`, and a colored PNG overlay

### 🗺️ GIS Mapping & Spatial Layers
- Interactive Leaflet.js map with layer toggle controls
- WMS tile proxy with polygon clipping for wheat, sugarcane, cotton, LULC layers
- Agro-ecological zone analysis across all 4 provinces (Punjab, Sindh, KPK, Balochistan)
- LULC area calculation (km² and acres) via PostGIS `ST_Intersection` + `ST_Area`
- Flood layers and climate data visualization

### 🌾 Crop Classification Maps
- Wheat (`wheat_25_all`) — nationwide via PostGIS
- Sugarcane (`sugarcane_pakistan`) — grouped by gridcode
- Cotton (`cotton_pakistan`) — Punjab-restricted
- All support both bbox and polygon geometry filters

### 👤 Authentication & Role-Based Access
- Django REST Framework Token Authentication
- `RegisterView` and `LoginView` with role, province, district, tehsil metadata
- Custom `UserPortal` model for white-label portal name and logo
- Session persisted in localStorage on frontend



### 📦 Farm Data Management
- Save farm KML polygon coordinates linked to CNIC + farm name
- Unique constraint: same CNIC cannot register duplicate farm names
- KML coordinates update with GeoJSON feature properties
- Fetch all farm polygons by CNIC number

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Bootstrap, JavaScript (ES6+) |
| GIS Maps | Leaflet.js |
| Charts | Chart.js |
| Backend | Django 4.x, Django REST Framework |
| Database | PostgreSQL 14+ with PostGIS extension |
| Spatial ORM | psycopg2, SQLAlchemy, GeoPandas |
| Satellite | Sentinel Hub OAuth API, Rasterio, Mercantile |
| AI Model | Segment Anything Model (SAM ViT-L via `samgeo`) |
| Map Server | GeoServer (Docker) |
| Auth | DRF Token Authentication |
| Weather | OpenWeather API |
| Crop Rates | AIMS (Punjab Government API) |


---

## System Requirements

### Hardware
| Component | Minimum | Recommended |
|---|---|---|
| CPU | 4-core | 8-core |
| RAM | 8 GB | 16 GB |
| GPU | — | NVIDIA CUDA (for SAM) |
| Storage | 20 GB | 50 GB+ |

### Software
| Requirement | Version |
|---|---|
| Python | 3.10 or 3.11 |
| Django | 4.x |
| PostgreSQL | 14+ |
| PostGIS | 3.x |
| Docker | Latest |
| Node.js (optional) | 18+ |
| CUDA Toolkit (optional) | 11.8+ |

### Python Dependencies

```txt
django
djangorestframework
psycopg2-binary
geopandas
rasterio
mercantile
shapely
Pillow
numpy
requests
torch
samgeo
sqlalchemy
pandas
```

Install all at once:
```bash
pip install -r requirements.txt
```

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/smart-agro-farms.git
cd smart-agro-farms
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up PostgreSQL + PostGIS

```sql
CREATE DATABASE gisdb;
CREATE USER gisuser WITH PASSWORD 'gispassword';
GRANT ALL PRIVILEGES ON DATABASE gisdb TO gisuser;
\c gisdb
CREATE EXTENSION postgis;
```

### 5. Configure your database in `settings.py`

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'gisdb',
        'USER': 'gisuser',
        'PASSWORD': 'gispassword',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 6. Run migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Start GeoServer via Docker

```bash
docker run -d -p 8080:8080 --name geoserver kartoza/geoserver
```

GeoServer will be available at: `http://localhost:8080/geoserver`

### 8. Start the Django development server

```bash
python manage.py runserver
```

### 9. (Optional) Start LM Studio for AI chat

Download [LM Studio](https://lmstudio.ai/), load `deepseek-r1-distill-llama-8b`, and start the local server on port `1234`.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Sentinel Hub credentials
SENTINEL_CLIENT_ID=your-client-id
SENTINEL_CLIENT_SECRET=your-client-secret

# Django
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=gisdb
DB_USER=gisuser
DB_PASSWORD=gispassword
DB_HOST=localhost
DB_PORT=5432

# Media
MEDIA_ROOT=/path/to/media/
```

> ⚠️ Never commit your `.env` file. Add it to `.gitignore`.

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register/` | Register new user — returns DRF token |
| POST | `/login/` | Login — returns token, role, province, district, tehsil, portal info |

### Satellite & SAM

| Method | Endpoint | Description |
|---|---|---|
| GET | `/fetch-token/` | Fetch Sentinel Hub OAuth token (auto-expires 45 min) |
| POST | `/save-bbox/` | Save bounding box + auto-generate GeoTIFF |
| GET | `/get-bbox/` | Retrieve latest saved bounding box |
| POST | `/process-tiff/` | Run SAM ViT-L on `satellite_map.tif` → masks |
| GET | `/get-masks-geojson/` | Retrieve `masks.geojson` output |
| GET | `/get-colored-masks/` | Serve `color_mask.png` image |

### Spatial Analysis

| Method | Endpoint | Description |
|---|---|---|
| POST | `/calculate-area/` | LULC area by bbox or polygon (km², acres) |
| POST | `/fetch-zones/` | Agro-ecological zones for all provinces |
| POST | `/wheat-stats/` | Wheat coverage area + features |
| POST | `/sugarcane-stats/` | Sugarcane coverage area + features |
| POST | `/cotton-stats/` | Cotton coverage area (Punjab only) |

### WMS & Tiles

| Method | Endpoint | Description |
|---|---|---|
| POST | `/proxy-wms/` | Fetch + clip GeoServer WMS image to polygon |
| POST | `/register-geometry/` | Register polygon → returns geometry token |
| GET | `/tile/<z>/<x>/<y>/` | Serve clipped WMS tile using geometry token |
| GET | `/proxy-feature-info/` | Forward WMS GetFeatureInfo to GeoServer |

### Farm Data

| Method | Endpoint | Description |
|---|---|---|
| POST | `/save-user-data/` | Save farmer CNIC + farm name + KML coordinates |
| POST | `/get-kml/` | Fetch all farm polygons by CNIC |
| POST | `/update-kml/` | Update or delete farm coordinates |

### Advisory Chat

| Method | Endpoint | Description |
|---|---|---|
| POST | `/ask/` | Ask agricultural question to local LLM |

---

## Database Models

### `BoundingBox`
Stores the user-drawn farm bounding box.

| Field | Type | Description |
|---|---|---|
| `name` | CharField | Optional label |
| `min_latitude` | FloatField | South bound |
| `min_longitude` | FloatField | West bound |
| `max_latitude` | FloatField | North bound |
| `max_longitude` | FloatField | East bound |
| `created_at` | DateTimeField | Auto timestamp |

### `UserData`
Stores farmer KML polygon coordinates.

| Field | Type | Description |
|---|---|---|
| `name` | CharField | Farmer name |
| `cnic_number` | CharField | Pakistan CNIC (max 15 chars) |
| `farm_name` | CharField | Unique per CNIC |
| `kml_coordinates` | JSONField | Polygon coordinates array |

> Unique constraint: `(cnic_number, farm_name)`

### `TokenStorage`
Caches the Sentinel Hub OAuth access token.

| Field | Type | Description |
|---|---|---|
| `token` | TextField | OAuth access token |
| `created_at` | DateTimeField | Creation timestamp |

### `UserPortal`
White-label portal branding per user.

| Field | Type | Description |
|---|---|---|
| `user` | OneToOneField | Links to `CustomUser` |
| `portal_name` | CharField | Organization/portal name |
| `logo` | ImageField | Optional logo upload |

---

## User Roles & Access

| Role | Crop History | Features |
|---|---|---|
| **Community Farmer** | 1 month | Crop health, weather, soil, water, irrigation advisory, crop rates |
| **Progressive Farmer** | 6 months | All Community + fertilizer calculator, PDF report |
| **Enterprise Farmer** | 1 year | All Progressive + flood layers, agro-ecological zones, AI detection, province/district/tehsil analysis, LULC |
| **Government / Researcher** | 1 year | All Enterprise + nationwide crop monitoring (Wheat, Sugarcane, Cotton-Punjab), bulk water requirement, climate layers |

---

## Frontend Pages

| File | Description |
|---|---|
| `index.html` | Landing dashboard |
| `login.html` | Login + registration modal |
| `map.html` | Main GIS map with all layers |
| `vector.html` | SAM vector output viewer |
| `test.html` | API testing interface |

All pages use the Fetch API to communicate with the Django backend. Authentication token is stored in `localStorage`.

---

## SAM AI Object Detection

The system uses **Segment Anything Model (SAM) ViT-L** via the `samgeo` library:

1. User draws a bounding box on the map
2. Backend fetches Google satellite tiles at zoom level 19 and merges them into `satellite_map.tif`
3. POST to `/process-tiff/` triggers SAM:
   - Loads `newsam.pth` checkpoint (ViT-L)
   - Detects objects → `masks.tif`
   - Converts to `masks.gpkg` (GeoPackage) and `masks.geojson`
   - Generates a color-coded `color_mask.png`
4. Frontend renders GeoJSON polygons on the Leaflet map

**GPU acceleration:** If CUDA is available (`torch.cuda.is_available()`), SAM runs on GPU automatically.

---

## GeoServer Integration

GeoServer runs in Docker and serves WMS tiles for:

- `gis:wheat` — Wheat classification layer
- `gis:sugarcane` — Sugarcane classification layer
- `gis:cotton` — Cotton classification layer (Punjab)
- LULC, agro-ecological zones, flood layers

The backend proxy (`proxy_wheat_wms`) fetches WMS images and clips them to the user's drawn polygon using Shapely + Pillow, removing black/white background artifacts before returning a clean transparent PNG.

GeoServer URL: `https://limsbackhend.ngrok.pro/geoserver` (configure in settings for local deployment)

---

## Project Structure

```
smart-agro-farms/
│
├── analyzer/
│   ├── views.py          # All API view functions
│   ├── models.py         # BoundingBox, UserData, TokenStorage, UserPortal
│   ├── urls.py           # URL routing
│   ├── admin.py          # Django admin registration
│   └── migrations/       # Database migrations
│
├── users/
│   └── models.py         # CustomUser with role, province, district, tehsil
│
├── templates/
│   ├── index.html
│   ├── login.html
│   ├── map.html
│   ├── vector.html
│   └── test.html
│
├── media/
│   ├── satellite_map.tif  # Downloaded GeoTIFF
│   ├── masks.tif          # SAM output masks
│   ├── masks.gpkg         # GeoPackage vector
│   ├── masks.geojson      # GeoJSON polygons
│   ├── color_mask.png     # Colored mask preview
│   └── newsam.pth         # SAM ViT-L model checkpoint
│
├── manage.py
├── requirements.txt
└── README.md
```

---

## Team

**Smart Agro Farms — Final Year Project**
Riphah International University, Islamabad — Faculty of Computing
BS Software Engineering | Spring/Fall 2025

| Name | Roll No |
|---|---|
| Muhammad Umar | 35667 |
| Muhammad Abdullah | 37531 |
| Faizan Malik | 35716 |

**Supervisor:** Mr. Muhammad Abdullah

---

## License

This project is submitted as a Final Year Project (FYP) at Riphah International University, Islamabad. All rights reserved by the authors.
