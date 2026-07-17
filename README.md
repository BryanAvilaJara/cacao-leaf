# Cacao Leaf

Cacao Leaf es una plataforma web y movil para el analisis preliminar de hojas de cacao mediante imagenes. Permite capturar o cargar una fotografia, procesarla en una API propia y obtener una clasificacion inicial con nivel de confianza, observaciones y recomendaciones de seguimiento.

El producto esta orientado a productores, tecnicos de campo y equipos agricolas que necesitan registrar evidencias visuales y priorizar revisiones tempranas de posibles patologias visibles en hojas de cacao.

## Autores

- Bryan Avila Jara
- Job Inga

## Funcionalidades

- Captura de imagen desde camara o galeria.
- Procesamiento de imagen mediante backend Django REST.
- Clasificacion preliminar como hoja aparentemente sana o posible patologia visible.
- Resultado con porcentaje de confianza, notas y recomendacion.
- Historial de analisis procesados.
- Validacion de formato, tamano y contenido real de imagen.
- Interfaz compatible con web, Android e iOS mediante Expo.

## Arquitectura

```text
mobile/
  App Expo / React Native
  Pantallas de inicio, analisis, historial e informacion

backend/
  API Django REST Framework
  Validacion de imagenes
  Clasificador de hoja de cacao
  Persistencia de analisis

docs/
  Documentacion tecnica, arquitectura y accesibilidad
```

## Stack Tecnico

- Frontend: React Native, Expo, TypeScript.
- Backend: Django, Django REST Framework.
- Procesamiento de imagen: Pillow, NumPy, scikit-learn, h5py.
- Base de datos por defecto: SQLite.
- Despliegue backend: Render.
- Despliegue web recomendado: Netlify o Render Static Site.

## API

Endpoints principales:

- `GET /api/health/`
- `GET /api/analyses/`
- `POST /api/analyses/` con campo multipart `image`
- `GET /api/analyses/{id}/`
- `DELETE /api/analyses/clear/`

Ejemplo de respuesta:

```json
{
  "id": 1,
  "image_url": "https://cacao-leaf-api.onrender.com/media/leaf_uploads/leaf.jpg",
  "status": "healthy",
  "status_display": "Hoja sana",
  "confidence": "88.50",
  "disease_label": "Hoja aparentemente sana",
  "recommendation": "Mantener monitoreo preventivo...",
  "notes": "No se observan senales visuales relevantes en la imagen analizada.",
  "created_at": "2026-07-17T14:00:00Z"
}
```

## Ejecucion Local

Backend:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Frontend:

```powershell
cd mobile
npm install
$env:EXPO_PUBLIC_API_URL="http://127.0.0.1:8000"
npm run web
```

Para dispositivo fisico en red local, usar la IP del equipo donde corre el backend:

```powershell
$env:EXPO_PUBLIC_API_URL="http://TU_IP_LOCAL:8000"
npm run start
```

## Despliegue

El backend incluye configuracion para Render en `render.yaml`.

```text
Servicio: cacao-leaf-api
Root directory: backend
Build command: pip install -r requirements.txt && python manage.py migrate
Start command: gunicorn cacao_api.wsgi:application --bind 0.0.0.0:$PORT
```

Para publicar la app web, construir Expo apuntando al backend desplegado:

```powershell
cd mobile
$env:EXPO_PUBLIC_API_URL="https://cacao-leaf-api.onrender.com"
npm run build:web
```

El resultado puede publicarse como sitio estatico en Netlify o Render Static Site.

## Modelo de Clasificacion

El backend intenta usar el modelo entrenado en:

```text
backend/diagnostics/ml/models/cacao_leaf_model.h5
```

Si el modelo no esta disponible, el sistema conserva un clasificador deterministico de respaldo basado en caracteristicas visuales de la imagen. La salida mantiene el mismo contrato de API para que el modelo pueda evolucionar sin cambiar la app cliente.

Dataset de referencia:

- CocoaSwolSet, Mendeley Data, DOI `10.17632/hvwth9dsfd.2`.
- Licencia: CC BY 4.0.

## Verificacion

Backend:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python manage.py check
python manage.py test
```

Frontend:

```powershell
cd mobile
npm run typecheck
```

## Aviso

Cacao Leaf entrega una clasificacion preliminar basada en imagenes. No reemplaza el diagnostico profesional de un especialista agricola ni debe utilizarse como unica base para aplicar tratamientos.
