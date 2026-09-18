# EditFun 🎬⚡
> **Herramientas interactivas y simuladores visuales para editores de vídeo y creadores de contenido.**  
> Desarrollado por **[EternoDev](https://github.com/paucg06)**.

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen?style=flat-square&logo=github)](https://paucg06.github.io/Edit-Fun/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![License: CC BY-NC-ND 4.0](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-red?style=flat-square)](LICENSE)

---

## 🌐 Demo en Vivo
Puedes acceder a la suite completa desplegada en **GitHub Pages**:  
🔗 **[https://paucg06.github.io/Edit-Fun/](https://paucg06.github.io/Edit-Fun/)**

---

## 🛠️ Herramientas Incluidas

La suite cuenta con **6 aplicaciones web independientes** y un **Hub principal** ([index.html](index.html)):

### 1. 🔍 GoogleFake (`google.html`)
* **Propósito**: Simulador dinámico del buscador de Google para insertar búsquedas y transiciones realistas en vídeos.
* **Características**:
  * Autocompletado y animación fluida al escribir.
  * Selector de temas (Oscuro / Claro).
  * Interfaz idéntica al buscador oficial.

### 2. 📈 999,999 Views (`views.html`)
* **Propósito**: Simulador de estadísticas y barra de reproducciones de YouTube.
* **Características**:
  * Métricas visuales de visitas, likes y comentarios.
  * Barra de progreso animada interactiva.
  * Estética moderna basada en YouTube Studio.

### 3. 💻 Windows Errors (`errors.html`)
* **Propósito**: Generador de pantallas de error BSOD (Blue Screen of Death) de Windows.
* **Características**:
  * **Modo Realista**: Pantalla azul oficial de Windows 10/11 con código QR y porcentaje de progreso interactivo.
  * **Modo Meme**: Pantalla humorística `( ._.)` con textos y stop codes personalizables.
  * Atajo de teclado `F11` para pantalla completa.

### 4. 💬 Edit Comments (`comments.html`)
* **Propósito**: Generador y editor ultra-fiel de tarjetas de comentarios de YouTube.
* **Características**:
  * Modo **Dark** y **Light** idéntico al pixel de YouTube.
  * Búsqueda automática de avatar oficial de canales con el botón `Auto @`.
  * Soporte para insignias de **Canal Verificado** y **Autor del Canal**.
  * Fila de **Comentario Fijado** ("Fijado por...") y **Corazón del Creador** con miniatura superpuesta.
  * Exportación directa a imagen **PNG de alta resolución** y vector **SVG**.

### 5. ⏱️ Time Up (`timer.html`)
* **Propósito**: Temporizador digital de 7 segmentos y cronómetro con físicas de velocidad avanzadas.
* **Características**:
  * Tipografía digital retro auténtica (`DSEG7-Classic`).
  * 3 modos de velocidad: **Velocidad Normal (1x)**, **Velocidad Personalizada (hasta 100x)** y **Velocidad Timelapse**.
  * **Curva de velocidad interactiva**: Gráfico SVG de 3 puntos arrastrables para aceleraciones orgánicas in crescendo.
  * Sonidos sintetizados por **Web Audio API** (*Pitido Digital*, *Campana*, *Alarma Doble*, *Silencio*).
  * Sincronización en tiempo real entre el panel y el display.

### 6. 💥 Pop & Rain (`popups.html`)
* **Propósito**: Generador dinámico de cascadas de ventanas/errores (rastro diagonal estilo Windows crash), pop-ups dispersos y lluvia de partículas.
* **Características**:
  * **Zona Dropzone Drag & Drop (`+`)**: Sube múltiples imágenes al instante con visor de miniaturas y eliminación individual.
  * **Presets Rápidos Integrados**: *Errores Windows / Virus*, *Billetes de $100*, *Comentarios de YouTube*, *Likes y Reacciones*, *Monedas de Oro*.
  * **3 Modos de Animación Completos**:
    * **Cascada (Rastro Diagonal)**: Duplica y agrupa las ventanas en diagonales sucesivas con paso en píxeles (efecto clásico de ventana congelada / error en cadena).
    * **Pop-ups (Aparición)**: Aparición progresiva en pantalla con efecto glitch/hackeado o rebote.
    * **Lluvia 3D**: Caída de partículas con física oscilante y balanceo tridimensional.
  * **Diseñado para Edición**: Fondos croma verde y azul, modo limpio con la tecla `H` para grabación con OBS y atajos de teclado rápidos.

---

## 📁 Estructura del Proyecto

```
Edit-Fun/
├── index.html                    # Menú principal y hub interactivo
├── google.html                   # Herramienta 1: GoogleFake
├── views.html                    # Herramienta 2: 999,999 Views
├── errors.html                   # Herramienta 3: Windows Errors
├── comments.html                 # Herramienta 4: Edit Comments
├── timer.html                    # Herramienta 5: Time Up
├── popups.html                   # Herramienta 6: Pop & Rain
├── README.md                     # Documentación del repositorio
└── assets/
    ├── png/                      # Iconos, favicons y recursos gráficos PNG
    │   ├── 999views_icon.png
    │   ├── comment_icon.png
    │   ├── death-10-qr-code.png
    │   ├── editfun_icon.png
    │   ├── time_up_icon.png
    │   ├── windows_error_icon.png
    │   └── windowserror_icon.png
    ├── svg/                      # Vectores e iconos SVG
    │   ├── Dilike_U.svg
    │   ├── Dislike.svg
    │   ├── Dislike_U.svg
    │   ├── Fix.svg
    │   ├── Like.svg
    │   ├── Like_U.svg
    │   └── Unlike.svg
    └── js/                       # Librerías JavaScript locales
        └── html2canvas.min.js
```

---

## 🚀 Despliegue en GitHub Pages

Para publicar este proyecto gratis con **GitHub Pages**:

1. En tu repositorio en GitHub, ve a la pestaña **Settings** (Configuración).
2. En el menú lateral izquierdo, haz clic en **Pages**.
3. En la sección **Build and deployment > Branch**:
   * Selecciona la rama: **`main`**
   * Selecciona la carpeta: **`/ (root)`**
4. Haz clic en **Save**. En un par de minutos tu web estará disponible en:  
   `https://paucg06.github.io/Edit-Fun/`

---

## 👤 Autor y Redes
* 🌐 **Web Oficial**: [eternodev.com](https://eternodev.com)
* 📺 **YouTube**: [@eternodev](https://www.youtube.com/@eternodev)
* 🐙 **GitHub**: [@paucg06](https://github.com/paucg06)
* 🍌 **Buy Me a Coffee**: [buymeacoffee.com/eternodev](https://buymeacoffee.com/eternodev)

---

## 📜 Licencia

Copyright (c) 2026 **Pau / EternoDev**. Todos los derechos reservados.

Este proyecto cuenta con una **Licencia Propietaria de Código Visible y Uso Personal No Comercial** ([LICENSE](LICENSE)):
* ✅ **Permitido**: Ver, inspeccionar el código fuente y utilizar la aplicación de forma personal y privada en local.
* ❌ **Prohibido**: Republicar, redistribuir, re-hostear en otras webs o servidores, vender o utilizar comercialmente total o parcialmente este software sin autorización expresa.

