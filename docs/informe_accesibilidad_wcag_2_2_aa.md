# Informe tecnico de accesibilidad WCAG 2.2 AA

Proyecto evaluado: **Entregable 2 IHC - Cacao Leaf**  
Fecha de evaluacion: **10 de julio de 2026**  
Base normativa: **WCAG 2.2, nivel AA**  
Tipo de evaluacion: revision de codigo, contraste calculado y verificacion funcional parcial. Las pruebas con lector de pantalla quedan identificadas como manuales.

## 1. Descripcion del proyecto

Cacao Leaf es un prototipo academico para realizar una clasificacion preliminar de hojas de cacao a partir de imagenes. La aplicacion permite seleccionar o tomar una fotografia, enviarla al backend, recibir una clasificacion preliminar, consultar historial y revisar informacion de uso y limitaciones.

Tecnologias identificadas:

- Frontend: React Native con Expo, TypeScript y `lucide-react-native`.
- Backend: Django, Django REST Framework, SQLite y Pillow.
- Comunicacion: API REST con endpoints `/api/health/`, `/api/analyses/`, `/api/analyses/{id}/` y `/api/analyses/clear/`.
- Plataforma prevista: Android, iOS y web mediante Expo.

Pantallas evaluadas:

- Inicio: `mobile/src/screens/HomeScreen.tsx`.
- Analizar hoja: `mobile/src/screens/AnalyzeScreen.tsx`.
- Historial y modales de detalle/confirmacion: `mobile/src/screens/HistoryScreen.tsx`.
- Informacion: `mobile/src/screens/InfoScreen.tsx`.
- Navegacion inferior: `mobile/src/components/TabBar.tsx`.
- Boton reutilizable: `mobile/src/components/PrimaryButton.tsx`.
- Cliente API y validaciones: `mobile/src/api/client.ts`, `backend/diagnostics/serializers.py`.

## 2. Planificacion de la evaluacion

### Objetivo

Determinar el grado de conformidad del prototipo con WCAG 2.2 nivel AA, identificar barreras de accesibilidad y aplicar correcciones directas en el codigo cuando no alteren la funcionalidad principal ni el diseno visual.

### Alcance

La evaluacion cubre la interfaz movil/web implementada en React Native, sus componentes reutilizables, el flujo de seleccion/procesamiento de imagen, historial, modales, mensajes de error, estados de controles y estructura semantica. El backend se reviso solo en lo relacionado con validaciones y mensajes que se exponen al usuario.

No se evaluo la precision del modelo de clasificacion, ni se ejecuto una auditoria completa con usuarios reales. Las pruebas con TalkBack o VoiceOver se documentan como pruebas manuales pendientes porque no pueden comprobarse completamente solo desde el codigo.

### Criterios WCAG 2.2 evaluados

Se evaluaron los siguientes criterios, seleccionados por su relacion directa con una app movil/web:

- 1.1.1 Contenido no textual.
- 1.3.1 Informacion y relaciones.
- 1.3.4 Orientacion.
- 1.4.1 Uso del color.
- 1.4.3 Contraste minimo.
- 1.4.4 Cambio de tamano del texto.
- 2.1.1 Teclado.
- 2.1.2 Sin trampas de teclado.
- 2.4.3 Orden del foco.
- 2.4.6 Encabezados y etiquetas.
- 2.4.7 Foco visible.
- 2.5.3 Etiqueta en el nombre.
- 2.5.8 Tamano del objetivo.
- 3.2.1 Al recibir foco.
- 3.3.1 Identificacion de errores.
- 3.3.3 Sugerencias ante errores.
- 4.1.2 Nombre, funcion, valor.
- 4.1.3 Mensajes de estado.

### Herramientas utilizadas

- Revision estatica de codigo con busquedas `rg`.
- Calculo manual/asistido de contraste a partir de `mobile/src/theme/colors.ts`.
- TypeScript: `npm run typecheck`.
- Django: `python manage.py check` y `python manage.py test`.
- Inspeccion de configuracion Expo en `mobile/app.json`.

### Dispositivos o plataformas consideradas

- Android con TalkBack.
- iOS con VoiceOver.
- Web mediante Expo/React Native Web.
- Pantallas tactiles de telefono y tablet.
- Navegacion por teclado en web cuando corresponda.

### Procedimiento de evaluacion

1. Inventariar pantallas, componentes y flujos interactivos.
2. Revisar estructura semantica, textos, imagenes, iconos, botones y estados.
3. Revisar colores y calcular ratios de contraste.
4. Revisar areas tactiles y orientacion.
5. Revisar mensajes de error del backend y su presentacion en frontend.
6. Aplicar correcciones localizadas.
7. Ejecutar verificacion automatica disponible.
8. Documentar resultados, severidad, evidencia y pasos manuales pendientes.

### Criterios de cumplimiento

- **Cumple**: el codigo contiene mecanismos suficientes para satisfacer el criterio o no se detecta barrera verificable.
- **Cumple parcialmente**: el codigo mejora o cubre parte del criterio, pero requiere prueba manual o existen riesgos residuales.
- **No cumple**: se identifica una barrera clara en codigo o configuracion.

## 3. Ejecucion de las pruebas

### Contraste entre texto y fondo

La paleta principal se define en `mobile/src/theme/colors.ts`. Los pares principales cumplen el minimo AA de 4.5:1 para texto normal:

- `colors.text` sobre `colors.background`: 15.60:1.
- `colors.textMuted` sobre `colors.background`: 4.79:1.
- `colors.textMuted` sobre `colors.surface`: 5.16:1.
- `colors.primary` sobre `colors.surface`: 5.32:1.
- `colors.primary` sobre `colors.primarySoft`: 4.53:1.
- `colors.danger` sobre `colors.surface`: 6.33:1.
- `colors.warning` sobre `colors.surface`: 4.52:1.
- blanco sobre `colors.primary`: 5.32:1.

Resultado: **Cumple** para los pares revisados. Debe repetirse si se cambia la paleta o se incorporan nuevas imagenes de fondo.

### Tamano y escalabilidad del texto

React Native permite escalado de fuente por defecto al no definirse `allowFontScaling={false}`. Los tamanos base son legibles: titulos de 28 a 42 px, textos de 15 a 17 px, botones de 16 px. Riesgo residual: algunos contenedores visuales tienen alturas fijas, por ejemplo la vista previa de imagen y la barra inferior; se requiere validacion manual con texto al 200%.

Resultado: **Cumple parcialmente**.

### Etiquetas accesibles en botones, iconos, imagenes y campos

Se agregaron etiquetas e indicaciones accesibles en botones reutilizables, pestañas, filas de historial, imagen seleccionada, miniaturas, imagen ampliada, botones de cierre y controles principales.

Ejemplos:

- `PrimaryButton` expone `accessibilityLabel` y `accessibilityHint`.
- `TabBar` expone `accessibilityRole="tab"` y `accessibilityState={{ selected }}`.
- Imagen seleccionada en Analizar tiene `accessibilityLabel`.
- Iconos decorativos usan `accessibilityElementsHidden` e `importantForAccessibility="no"`.

Resultado: **Cumple** despues de las correcciones.

### Orden de navegacion y foco

El orden de lectura sigue el orden de renderizado: encabezado, descripcion, acciones, resultados o historial. En modales se agrego `accessibilityViewIsModal` para aislar el contenido modal en iOS. Se requiere prueba manual para confirmar el foco inicial y el retorno del foco al cerrar modal.

Resultado: **Cumple parcialmente**.

### Navegacion mediante teclado

En web, `Pressable` se renderiza como control interactivo compatible con foco. No se detectaron manejadores que bloqueen el teclado. Se requiere prueba manual en Expo Web con Tab, Enter, Espacio y Escape/cierre de modales.

Resultado: **Cumple parcialmente**.

### Compatibilidad con TalkBack o VoiceOver

El codigo ahora incluye roles, nombres, estados y alertas suficientes para una lectura basica. No se puede afirmar cumplimiento total sin ejecucion en dispositivo real. Las pruebas manuales se listan en la seccion de evidencias.

Resultado: **Cumple parcialmente**.

### Mensajes de error y validaciones accesibles

El backend ya valida formato, tamano y contenido real de imagen. El frontend ahora intenta recuperar el mensaje especifico enviado por la API y los errores visibles usan `accessibilityRole="alert"` y `accessibilityLiveRegion="assertive"`.

Resultado: **Cumple**.

### Tamano minimo de areas tactiles

Los botones principales tienen `minHeight: 48`; las pestañas miden 82 x 56; filas de historial tienen `minHeight: 96`. El boton de cierre del modal fue corregido de 42 x 42 a 44 x 44.

Resultado: **Cumple**.

### Dependencia exclusiva del color

El resultado no depende solo del color: ademas del color se muestran textos como `status_display`, `disease_label`, porcentaje de confianza, notas y recomendacion. Los estados de tabs usan color y fondo. Riesgo menor: la barra de confianza usa longitud/color como apoyo visual, pero tambien se muestra el porcentaje textual.

Resultado: **Cumple**.

### Textos alternativos

Se agregaron textos alternativos a imagen seleccionada, miniaturas e imagen ampliada. La imagen de fondo de Inicio se marco como decorativa para evitar ruido de lector de pantalla.

Resultado: **Cumple**.

### Encabezados y estructura semantica

Se agrego `accessibilityRole="header"` en titulos de pantallas, titulos de bloques y titulos de modales.

Resultado: **Cumple**.

### Estados seleccionados, deshabilitados y activos

`PrimaryButton` expone estado deshabilitado. `TabBar` expone estado seleccionado. Los botones mantienen estados presionados visuales. No hay controles complejos adicionales.

Resultado: **Cumple**.

### Orientacion de pantalla

Antes la app estaba bloqueada a `portrait` en `mobile/app.json`. Se corrigio a `default` para permitir orientacion vertical y horizontal, salvo que el sistema o dispositivo imponga restricciones.

Resultado: **Cumple** despues de la correccion.

## 4. Tabla de resultados

La tabla completa tambien fue generada en CSV: `docs/resultados_accesibilidad_wcag_2_2_aa.csv`.

| Codigo | Pantalla o componente | Criterio WCAG | Prueba realizada | Resultado | Evidencia encontrada en el codigo | Problema detectado | Severidad | Recomendacion | Archivo y linea |
|---|---|---|---|---|---|---|---|---|---|
| AX-01 | Paleta global | 1.4.3 | Calculo de contraste texto/fondo | Cumple | Colores centralizados y ratios >= 4.5:1 | Sin problema en pares principales | Baja | Recalcular al cambiar colores | `mobile/src/theme/colors.ts:1` |
| AX-02 | Boton reutilizable | 4.1.2, 2.5.3 | Revision de nombre/funcion/valor | Cumple | `accessibilityRole`, `accessibilityLabel`, `accessibilityHint` | Antes dependia del texto visible y no permitia hints | Alta | Mantener etiquetas descriptivas por accion | `mobile/src/components/PrimaryButton.tsx:29` |
| AX-03 | Boton reutilizable | 2.5.8 | Revision de area tactil | Cumple | `minHeight: 48` | Sin problema | Baja | Mantener minimo >= 44 px | `mobile/src/components/PrimaryButton.tsx:59` |
| AX-04 | TabBar | 4.1.2 | Revision de tabs | Cumple | Rol tab, etiqueta, hint y estado selected | Antes faltaba etiqueta/hint explicito | Alta | Probar anuncio con TalkBack/VoiceOver | `mobile/src/components/TabBar.tsx:27` |
| AX-05 | Inicio | 1.1.1 | Revision de imagen de fondo | Cumple | `ImageBackground accessible={false}` | Antes podia ser anunciada sin aportar informacion | Media | Mantenerla decorativa salvo que transmita informacion | `mobile/src/screens/HomeScreen.tsx:14` |
| AX-06 | Inicio | 1.3.1, 2.4.6 | Revision de encabezados y pasos | Cumple | Titulos con `header` y pasos agrupados | Antes los pasos podian leerse como numeros sueltos | Media | Validar lectura lineal | `mobile/src/screens/HomeScreen.tsx:24` |
| AX-07 | Analizar | 1.1.1 | Revision de imagen seleccionada | Cumple | `accessibilityLabel` en imagen | Antes no tenia alternativa textual | Alta | Describir funcion de la imagen, no detalles no comprobables | `mobile/src/screens/AnalyzeScreen.tsx:92` |
| AX-08 | Analizar | 3.3.1, 4.1.3 | Revision de errores visibles | Cumple | Error con `alert` y live region | Antes el error no se anunciaba como estado | Alta | Mantener mensajes especificos y accionables | `mobile/src/screens/AnalyzeScreen.tsx:150` |
| AX-09 | API/Analizar | 3.3.3 | Revision de validaciones | Cumple | Cliente lee errores de API; backend valida tipo, tamano e imagen real | Antes se mostraba error generico | Alta | Conservar mensajes por campo | `mobile/src/api/client.ts:25`; `backend/diagnostics/serializers.py:46` |
| AX-10 | Analizar | 1.4.1 | Revision de resultado y confianza | Cumple | Texto de estado, porcentaje, notas y recomendacion | Riesgo menor si se interpreta solo barra visual | Media | Mantener porcentaje textual junto a la barra | `mobile/src/screens/AnalyzeScreen.tsx:187` |
| AX-11 | Historial | 4.1.2, 2.4.6 | Revision de filas tactiles | Cumple | Fila con etiqueta completa e hint | Antes la fila no tenia nombre programatico suficiente | Alta | Mantener resumen conciso por fila | `mobile/src/screens/HistoryScreen.tsx:78` |
| AX-12 | Historial | 1.1.1 | Revision de miniatura e imagen ampliada | Cumple | Labels en miniatura e imagen ampliada | Antes las imagenes no tenian texto alternativo | Media | No inventar diagnostico desde la imagen | `mobile/src/screens/HistoryScreen.tsx:86`; `mobile/src/screens/HistoryScreen.tsx:139` |
| AX-13 | Historial/modales | 2.4.3, 4.1.2 | Revision de modales | Cumple parcialmente | `accessibilityViewIsModal` y boton cerrar etiquetado | Falta confirmar foco inicial y retorno de foco en dispositivo | Media | Probar manualmente con lector de pantalla | `mobile/src/screens/HistoryScreen.tsx:123` |
| AX-14 | Historial/modal | 2.5.8 | Revision boton cerrar | Cumple | Cierre 44 x 44 | Antes era 42 x 42 | Media | Mantener minimo tactil | `mobile/src/screens/HistoryScreen.tsx:329` |
| AX-15 | Info | 1.3.1, 2.4.6 | Revision estructura | Cumple | Encabezados en titulo y bloques | Antes los bloques no exponian jerarquia | Media | Mantener titulos como headers | `mobile/src/screens/InfoScreen.tsx:16` |
| AX-16 | Iconos | 1.1.1 | Revision de iconos decorativos | Cumple | Iconos ocultos del lector cuando son decorativos | Antes podian producir ruido | Media | Solo etiquetar iconos si reemplazan texto | `mobile/src/screens/InfoScreen.tsx:24` |
| AX-17 | App general | 1.3.4 | Revision de orientacion | Cumple | `orientation: "default"` | Antes estaba bloqueado a `portrait` | Alta | Validar layout en landscape | `mobile/app.json:6` |
| AX-18 | App general | 1.4.4 | Revision de escalabilidad | Cumple parcialmente | No se desactiva escalado de fuente | Riesgo en contenedores con alturas fijas | Media | Probar 200% y ajustar si hay recortes | `mobile/src/screens/HomeScreen.tsx:65`; `mobile/src/components/TabBar.tsx:51` |
| AX-19 | Web | 2.1.1, 2.1.2, 2.4.7, 3.2.1 | Revision de teclado | Cumple parcialmente | Controles implementados con `Pressable` | Requiere prueba manual en Expo Web | Media | Probar Tab, Enter, Espacio y cierre de modales | `mobile/src/components/PrimaryButton.tsx:28`; `mobile/src/components/TabBar.tsx:26` |
| AX-20 | App movil | 2.4.3, 4.1.2, 4.1.3 | Lectura con lector de pantalla | Cumple parcialmente | Roles, etiquetas, estados y alertas presentes | No comprobable solo desde codigo | Media | Ejecutar checklist manual | Varios archivos |

## 5. Hallazgos principales

### Problemas criticos

- Antes de la correccion, varios controles no tenian nombre/hint programatico suficientemente explicito.
- La orientacion estaba bloqueada a vertical, incumpliendo WCAG 1.3.4 si no existia una justificacion funcional.
- Los errores del flujo de analisis no se anunciaban como alertas y el cliente reemplazaba errores especificos por un mensaje generico.

### Problemas moderados

- Imagenes de resultado e historial carecian de texto alternativo.
- Los modales necesitaban mejor exposicion para lectores de pantalla.
- El boton de cierre del modal era menor al minimo tactil recomendado por WCAG 2.2.
- Los iconos decorativos podian generar ruido si eran anunciados.

### Problemas menores

- Riesgo residual de recorte visual con texto ampliado en contenedores con altura fija.
- La navegacion por teclado y el foco inicial/retorno en modales requieren confirmacion manual.

### Aspectos que cumplen correctamente

- La paleta principal tiene contraste suficiente para texto normal.
- Los botones principales ya tenian altura tactil adecuada.
- El resultado no depende solo del color: incluye texto, porcentaje, notas y recomendacion.
- El backend valida tipo, tamano y contenido real del archivo de imagen.

## 6. Correcciones realizadas

Archivos modificados:

- `mobile/app.json`.
- `mobile/src/api/client.ts`.
- `mobile/src/components/PrimaryButton.tsx`.
- `mobile/src/components/TabBar.tsx`.
- `mobile/src/screens/HomeScreen.tsx`.
- `mobile/src/screens/AnalyzeScreen.tsx`.
- `mobile/src/screens/HistoryScreen.tsx`.
- `mobile/src/screens/InfoScreen.tsx`.

### Correccion 1: nombres y ayudas accesibles en botones

Antes:

```tsx
<Pressable
  accessibilityRole="button"
  accessibilityState={{ disabled: Boolean(disabled) }}
>
```

Despues:

```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel={accessibilityLabel || label}
  accessibilityHint={accessibilityHint}
  accessibilityState={{ disabled: Boolean(disabled) }}
>
```

Impacto: mejora WCAG 4.1.2 y 2.5.3 al exponer nombre, funcion, valor y ayudas contextuales.

### Correccion 2: tabs con etiquetas y estado seleccionado

Antes:

```tsx
<Pressable accessibilityRole="tab" accessibilityState={{ selected }}>
```

Despues:

```tsx
<Pressable
  accessibilityRole="tab"
  accessibilityLabel={`Pestana ${item.label}`}
  accessibilityHint={`Muestra la pantalla ${item.label}`}
  accessibilityState={{ selected }}
>
```

Impacto: mejora el anuncio de navegacion inferior y el estado activo.

### Correccion 3: imagenes y fondo decorativo

Antes:

```tsx
<Image source={{ uri: imageUri }} style={styles.image} />
```

Despues:

```tsx
<Image
  source={{ uri: imageUri }}
  style={styles.image}
  accessibilityLabel="Imagen seleccionada de una hoja de cacao para analizar."
/>
```

Impacto: mejora WCAG 1.1.1. La imagen de fondo de Inicio se marco como decorativa con `accessible={false}`.

### Correccion 4: errores y estados de carga

Antes:

```tsx
{error ? <Text style={styles.error}>{error}</Text> : null}
```

Despues:

```tsx
{error ? (
  <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.error}>
    {error}
  </Text>
) : null}
```

Impacto: mejora WCAG 3.3.1 y 4.1.3 al anunciar errores como mensajes de estado.

### Correccion 5: errores especificos desde la API

Antes:

```ts
if (!response.ok) {
  throw new Error("No se pudo procesar la imagen.");
}
```

Despues:

```ts
if (!response.ok) {
  throw new Error(await getErrorMessage(response, "No se pudo procesar la imagen."));
}
```

Impacto: mejora WCAG 3.3.3 porque el usuario recibe mensajes como formato no permitido, imagen invalida o tamano maximo.

### Correccion 6: modales y cierre tactil

Antes:

```tsx
<View style={styles.modalCard}>
<Pressable accessibilityRole="button" onPress={() => setSelectedItem(null)} style={styles.closeButton}>
```

Despues:

```tsx
<View accessibilityViewIsModal style={styles.modalCard}>
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Cerrar detalle del analisis"
  onPress={() => setSelectedItem(null)}
  style={styles.closeButton}
>
```

Ademas, el boton de cierre paso de 42 x 42 a 44 x 44.

### Correccion 7: orientacion

Antes:

```json
"orientation": "portrait"
```

Despues:

```json
"orientation": "default"
```

Impacto: mejora WCAG 1.3.4 al no imponer una orientacion unica.

## 7. Resultados finales

Resumen:

- Total de criterios WCAG unicos evaluados: 18.
- Total de pruebas/resultados documentados en la tabla: 20.
- Cumple: 16.
- Cumple parcialmente: 4.
- No cumple: 0.
- Porcentaje estimado de cumplimiento despues de correcciones: 80% con evidencia completa; 100% sin no conformidades detectadas, sujeto a pruebas manuales pendientes.

Comparacion antes y despues:

- Antes de correcciones: 8 cumplian, 5 cumplian parcialmente y 7 no cumplian o tenian barreras claras desde el codigo.
- Despues de correcciones: 16 cumplen, 4 cumplen parcialmente y 0 quedan como no cumple desde revision de codigo.

Limitaciones:

- No se ejecuto TalkBack ni VoiceOver en dispositivo real.
- No se genero una auditoria automatica con Lighthouse/axe porque la app Expo no fue renderizada en navegador durante esta revision.
- El escalado de texto al 200% requiere inspeccion visual manual.
- El foco de teclado en Expo Web y el foco inicial/retorno de modales requieren validacion manual.
- La imagen de fondo remota puede cambiar o fallar; su contraste debe revisarse si se reemplaza.

Verificaciones ejecutadas:

- `npm run typecheck`: correcto.
- `python manage.py check`: correcto.
- `python manage.py test`: 7 pruebas correctas.

## 8. Evidencias y capturas requeridas

Capturas recomendadas para anexar al trabajo academico:

1. Pantalla Inicio en vertical: hero, boton "Analizar hoja" y pasos.
2. Pantalla Analizar sin imagen: estado "Sin imagen seleccionada".
3. Pantalla Analizar con imagen seleccionada antes de procesar.
4. Pantalla Analizar con resultado saludable.
5. Pantalla Analizar con resultado de posible patologia o confianza baja.
6. Pantalla Analizar con error: permiso denegado, archivo invalido o backend apagado.
7. Pantalla Historial con registros.
8. Modal "Detalle del analisis".
9. Modal "Limpiar historial".
10. Pantalla Informacion.
11. Pantallas Inicio, Analizar e Historial en orientacion horizontal.
12. Pantalla con tamano de texto aumentado al menos al 200%.

Pruebas que requieren ejecucion manual con TalkBack o VoiceOver:

- Lectura lineal de cada pantalla.
- Anuncio de pestanas y estado seleccionado.
- Anuncio de botones y hints.
- Anuncio de imagen seleccionada, miniaturas e imagen ampliada.
- Anuncio automatico de errores.
- Navegacion dentro de modales y retorno al cerrar.
- Verificacion de que los iconos decorativos no se anuncian.

### Checklist manual paso a paso

1. Activar TalkBack en Android o VoiceOver en iOS.
2. Abrir la app en Inicio.
3. Recorrer la pantalla de arriba hacia abajo y confirmar que se anuncia "Cacao Leaf", descripcion, boton "Analizar hoja" y los tres pasos completos.
4. Ir a cada pestana de la barra inferior y confirmar que se anuncia como pestana y que indica la seleccion actual.
5. Entrar a Analizar.
6. Confirmar que el estado sin imagen se anuncia como "No hay imagen seleccionada".
7. Activar "Camara" y "Galeria"; confirmar que el lector anuncia nombre y proposito.
8. Denegar un permiso y verificar que el error se anuncia automaticamente.
9. Seleccionar una imagen y confirmar que se anuncia como imagen seleccionada.
10. Ejecutar "Procesar imagen" y confirmar anuncio de progreso.
11. Revisar el resultado y confirmar que se leen estado, enfermedad, confianza, advertencia si aplica, notas y recomendacion.
12. Entrar a Historial.
13. Recorrer registros y confirmar que cada fila anuncia resultado, confianza, fecha y que abre detalle.
14. Abrir un detalle y verificar que el foco queda dentro del modal.
15. Cerrar el detalle y verificar que el foco vuelve al contexto anterior.
16. Abrir "Limpiar historial", cancelar y luego repetir para confirmar que ambos botones se anuncian correctamente.
17. Entrar a Informacion y confirmar que los encabezados se anuncian como secciones.
18. En Expo Web, repetir navegacion con Tab, Shift+Tab, Enter y Espacio.
19. Aumentar el tamano de fuente del sistema al 200% y revisar que no haya texto cortado ni superpuesto.
20. Rotar el dispositivo a horizontal y revisar que las pantallas principales sigan utilizables.
