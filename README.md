# LCD Custom Character Generator

Herramienta web para diseñar hasta 8 caracteres personalizados (custom characters) para pantallas LCD 16x2, y generar automáticamente el código Arduino listo para copiar y pegar.

---

## Créditos

<details>
<summary>Ver créditos</summary>

Este proyecto es una mejora/adaptación basada en el trabajo original de:

- **Repositorio original:** [RFDarter/LCD-Custom-Character-Generator](https://github.com/RFDarter/LCD-Custom-Character-Generator)
- **Página web oficial del proyecto:** [maxpromer.github.io/LCD-Character-Creator](https://maxpromer.github.io/LCD-Character-Creator/)

Todo el crédito por la idea original, la lógica base de dibujo y la generación de código Arduino es de sus autores. Este repositorio solo extiende y mejora esa base.

</details>

---

## ¿Qué hace el proyecto?

<details>
<summary>Ver descripción</summary>

Una pantalla LCD 16x2 normal solo puede mostrar letras, números y símbolos predefinidos. Pero el hardware permite además guardar hasta **8 símbolos propios** (llamados *custom characters*), dibujados píxel por píxel en una matriz de 5x8 (5 columnas, 8 filas). Esta herramienta te deja:

1. Dibujar esos símbolos con el mouse, celda por celda.
2. Ver una vista previa de cómo se vería tu símbolo dentro de una pantalla LCD real de 16x2.
3. Generar automáticamente el código Arduino (`byte customCharX[] = {...}`) listo para pegar en tu sketch, tanto para conexión paralela como I2C.

</details>

---

## Explicación de cada parte

<details>
<summary>Vista previa en LCD (arriba)</summary>

Simula cómo se vería la pantalla LCD real, con los 8 espacios de caracteres disponibles repartidos en 2 filas de 4. Al hacer clic en uno de esos espacios, seleccionas ese carácter para editarlo.

</details>

<details>
<summary>Editor de dibujo</summary>

Debajo de la vista previa están los 8 "lienzos" donde diseñas cada carácter. Cada uno es una cuadrícula de 5 columnas x 8 filas: haces clic (o clic y arrastras) sobre las celdas para "encender" o "apagar" píxeles, igual que se vería en la pantalla física.

</details>

<details>
<summary>Botones de edición</summary>

- **Limpiar / Resetear:** borra todos los píxeles del carácter seleccionado.
- **Invertir:** invierte todos los píxeles encendidos/apagados de todos los caracteres.
- **Duplicar ↓ / Duplicar ↑:** copia la mitad superior o inferior del dibujo hacia el otro lado, para crear símbolos simétricos verticalmente sin dibujar dos veces.
- **Duplicar ↔:** espeja el dibujo de izquierda a derecha (simetría horizontal).

</details>

<details>
<summary>Panel de configuración</summary>

- **Estructura:** cuántos caracteres personalizados vas a usar (de 1 a 8).
- **Color:** solo cambia la apariencia del editor (verde/azul), no afecta el código generado.
- **Interfaz:** genera el código para conexión **paralela** (pines directos) o **I2C** (módulo con dirección 0x27/0x3F).
- **Dato:** el formato en que se representan los píxeles en el código: **binario** (`B01000`) o **hexadecimal** (`0x08`).
- **Código Arduino:** el resultado final, ya con resaltado de sintaxis, listo para copiar.

</details>

<details>
<summary>Modo oscuro / claro</summary>

Botón en la parte superior para alternar el tema de toda la página, incluyendo el bloque de código (que en modo oscuro usa una paleta estilo terminal Linux en vez de fondo blanco). La preferencia se guarda en tu navegador.

</details>

---

## Fallos que encontramos y corregimos

<details>
<summary>Ver fallos corregidos</summary>

- **Vista previa no coincidía con el dibujo:** el código leía las filas y columnas de cada carácter al revés, por lo que dibujar en las últimas filas del editor no se reflejaba en la vista previa de arriba. Corregido.
- **Botones de duplicar/espejo no respondían:** los caracteres se identificaban con clases CSS que empezaban con un número (`.0`, `.1`, etc.), lo cual es inválido en un selector CSS y rompía la búsqueda del elemento en JavaScript. Se cambió a usar `data-index` en su lugar.
- **Fondo blanco del bloque de código en modo oscuro:** el tema por defecto de Prism.js forzaba fondo claro sin importar el tema de la página. Se agregó una paleta oscura tipo terminal para ese bloque específicamente.
- **Layout roto tras una edición de CSS:** en un ajuste intermedio se agregó `box-sizing: border-box` al carácter del editor, lo cual redujo el espacio interno disponible y desordenó los 5 píxeles por fila. Se revirtió.

</details>

---

## Pendiente / no resuelto

<details>
<summary>Ver pendientes</summary>

- **Botones "Duplicar ↓ / ↑ / ↔":** ya corregido el bug de selección que los rompía, pero no se volvió a confirmar en pantalla que el espejado se vea exactamente como se espera — vale la pena probarlos a fondo.
- **Distribuciones de estructura reducidas:** el proyecto original soportaba layouts adicionales (2x2, 3x2, 2x4, 4x2) en el selector de "Estructura". En esta versión simplificada solo quedaron las opciones de 1, 2, 4 u 8 caracteres en una sola fila; los demás layouts no se reimplementaron.
- **Sin guardado del dibujo:** si recargas la página se pierde todo el diseño actual; no hay persistencia (por ejemplo con `localStorage`) para los caracteres dibujados.
- **`app.py` (backend Flask):** quedó tal cual estaba desde el inicio, sin integrarse con las mejoras hechas en el frontend (la generación de código Arduino ahora ocurre solo en el JavaScript del navegador).

</details>

---

## Uso rápido

<details>
<summary>Ver pasos de uso</summary>

1. Abre `index.html` en tu navegador.
2. Selecciona cuántos caracteres vas a diseñar.
3. Dibuja tus símbolos en los lienzos.
4. Copia el código generado en la sección "Código Arduino".
5. Pégalo en tu sketch de Arduino, junto con `lcd.createChar(numero, customCharX)` para cada símbolo que quieras usar.

</details>