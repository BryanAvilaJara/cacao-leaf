# Entregable 2 IHC - Cacao Leaf

Solucion prototipo basada en el documento `AVILA e INGA (3).pdf`.

Tema: deteccion y clasificacion preliminar de patologias visibles en hojas de cacao mediante imagenes.

Tecnologias del Grupo 4:

- Backend: Django + Django REST Framework.
- Frontend: React Native + Expo.
- Base de datos local: SQLite.
- Procesamiento de imagen: clasificador prototipo en Python con Pillow.

## Estructura

```text
backend/
  cacao_api/        Configuracion principal de Django
  diagnostics/      API, modelo de datos y clasificador de hojas
mobile/
  src/api/          Cliente HTTP para consumir Django
  src/screens/      Pantallas Inicio, Analizar, Historial e Info
docs/
  arquitectura.md   Descripcion del flujo y endpoints
  prototipo-figma.html Maquetas visuales tipo Figma para exposicion
```

## Funcionalidades

- Cargar imagen de una hoja de cacao desde la app movil.
- Enviar la imagen al backend Django.
- Procesar la imagen con un clasificador prototipo.
- Clasificar la hoja como sana o con posible patologia visible.
- Mostrar confianza, notas y recomendacion basica.
- Consultar historial de analisis realizados.
- Mostrar informacion de sintomas y limitaciones del prototipo.

## Ejecutar backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Si `py` no esta disponible, instala Python 3.11 o superior y usa `python` en los mismos comandos.

Si el entorno virtual ya existe, puedes entrar directo:

```powershell
cd D:\xampp\htdocs\entregable2_IHC\backend
.\.venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## Ejecutar app Expo

```powershell
cd mobile
npm install
npm run start
```

Para probar desde un celular fisico, configura la URL del backend con la IP de tu PC:

```powershell
$env:EXPO_PUBLIC_API_URL="http://TU_IP_LOCAL:8000"
npm run start
```

En emulador Android se usa `http://10.0.2.2:8000` por defecto. En web o iOS local se usa `http://127.0.0.1:8000`.

Para probar rapido en navegador:

```powershell
cd D:\xampp\htdocs\entregable2_IHC\mobile
$env:EXPO_PUBLIC_API_URL="http://127.0.0.1:8000"
npm run web
```

## Pruebas

Backend:

```powershell
cd D:\xampp\htdocs\entregable2_IHC\backend
.\.venv\Scripts\Activate.ps1
python manage.py test
```

Frontend:

```powershell
cd D:\xampp\htdocs\entregable2_IHC\mobile
npm run typecheck
```

Pruebas funcionales para la exposicion:

- `PF01`: abrir `http://127.0.0.1:8000/api/health/` y verificar `status: ok`.
- `PF02`: desde la app, seleccionar una imagen valida de hoja y procesarla.
- `PF03`: intentar enviar un archivo no valido desde API/clientes de prueba y confirmar error comprensible.
- `PF04`: apagar el backend y presionar Procesar; la app debe mostrar error de conexion/procesamiento.
- `PF05`: abrir Historial y verificar que aparezcan los analisis registrados.
- `PF06`: revisar que el resultado diga clasificacion preliminar y no diagnostico definitivo.

## Endpoints principales

- `GET /api/health/`
- `GET /api/analyses/`
- `POST /api/analyses/` con campo multipart `image`
- `GET /api/analyses/{id}/`

## Nota tecnica

El clasificador actual es un prototipo deterministico basado en color de la imagen. Esta disenado para cumplir el flujo funcional del entregable y puede reemplazarse luego por un modelo real de deep learning sin cambiar la app movil.

## Evolucion IA preparada

Se agrego y conecto la estructura `backend/diagnostics/ml/`:

```text
backend/diagnostics/ml/
  config.py
  preprocessing.py
  model_loader.py
  inference.py
  train.py
  metrics.py
  dataset/train/
  dataset/val/
  dataset/test/
  models/
```

Dataset usado:

- CocoaSwolSet, Mendeley Data, DOI `10.17632/hvwth9dsfd.2`.
- Licencia: CC BY 4.0.
- Para esta primera prueba se usaron solo imagenes de hojas, separadas en `healthy` y `pathology`.

Modelo entrenado:

- Archivo: `backend/diagnostics/ml/models/cacao_leaf_model.h5`.
- Tipo: modelo ML de regresion logistica con caracteristicas de color/histograma de imagen.
- Resultado de la corrida actual: `accuracy test = 0.8638` sobre 213 imagenes de prueba.

Comandos para repetir el proceso:

```powershell
cd D:\xampp\htdocs\entregable2_IHC\backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m diagnostics.ml.prepare_dataset --zip diagnostics\ml\cocoaswolset.zip --max-per-class 800
python -m diagnostics.ml.train
```

El backend ya intenta usar primero el modelo entrenado. Si `cacao_leaf_model.h5` no existe, vuelve automaticamente al clasificador por color.

## Guion breve de presentacion

1. Explicar el problema: apoyo preliminar para detectar sintomas visibles en hojas de cacao.
2. Mostrar la arquitectura: app Expo, API Django REST Framework, SQLite y clasificador.
3. Aclarar el alcance: el clasificador actual es por color y valida el flujo completo, no es una CNN entrenada.
4. Hacer demo: backend activo, app web/movil, seleccionar imagen, procesar y revisar historial.
5. Mostrar la evolucion semanal: validaciones, pruebas backend, contrato JSON estable, dataset CocoaSwolSet y modelo `.h5` conectado.
6. Cerrar con la siguiente fase: ampliar dataset, entrenar con mas imagenes o con CNN/transfer learning y comparar metricas.
