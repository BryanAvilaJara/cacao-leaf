# Arquitectura del Prototipo

## Flujo funcional

1. El usuario abre la app movil.
2. Selecciona una imagen de una hoja de cacao.
3. React Native envia la imagen a Django usando `multipart/form-data`.
4. Django guarda el archivo en `backend/media/leaf_uploads/`.
5. El modulo `diagnostics.classifier` procesa la imagen.
6. La API devuelve resultado, confianza, notas y recomendacion.
7. La app muestra el resultado y permite consultar el historial.

## Backend

El backend esta organizado como API REST:

- `LeafAnalysis`: almacena imagen, estado, confianza, etiqueta, notas y recomendacion.
- `LeafAnalysisSerializer`: valida la imagen y ejecuta el clasificador al crear el registro.
- `LeafAnalysisViewSet`: expone creacion, listado y detalle.
- `classify_cacao_leaf`: punto de reemplazo para integrar un modelo real.

## Frontend Movil

Pantallas implementadas:

- Inicio: presenta el objetivo del prototipo.
- Analizar: selecciona imagen, envia al backend y muestra resultado.
- Historial: lista analisis guardados.
- Info: resume sintomas visibles y limitaciones.

## Reemplazo por Modelo Real

Para integrar IA entrenada:

1. Colocar el modelo en `backend/diagnostics/model/`.
2. Cargarlo una vez en `classifier.py`.
3. Reemplazar la heuristica por inferencia real.
4. Mantener la salida `ClassificationResult` para no modificar la API ni la app.

## Contrato de Respuesta

```json
{
  "id": 1,
  "image_url": "http://localhost:8000/media/leaf_uploads/leaf.jpg",
  "status": "healthy",
  "status_display": "Hoja sana",
  "confidence": "88.50",
  "disease_label": "Hoja aparentemente sana",
  "recommendation": "Mantener monitoreo preventivo...",
  "notes": "Predominan tonos verdes...",
  "created_at": "2026-05-15T21:00:00Z"
}
```
