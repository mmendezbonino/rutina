# Cuaderno de Rutina

App de entrenamiento instalable (PWA): rutinas por día, registro de series, temporizador de descanso, historial con progreso y técnica de cada ejercicio en 3D.

**Abrir e instalar:** https://mmendezbonino.github.io/rutina/ → en Chrome, menú ⋮ → *Instalar app*.

Los datos se guardan en el celular (localStorage). Desde **Rutinas → Respaldo** se descarga o importa una copia.

## Cómo actualizar

1. Editar los archivos (casi todo está en `index.html`; las animaciones en `anim3d.js`).
2. `python3 release.py` para marcar una versión nueva (cambia `sw.js` e `index.html`).
3. `git commit` + `git push`. GitHub Pages publica en 1–2 minutos y la app muestra **"Hay una versión nueva → Actualizar"**.

Si no se corre `release.py`, los celulares siguen usando la versión guardada.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La app completa (interfaz, rutinas, registro, historial) |
| `anim3d.js` | Motor de animaciones 3D y los 20 ejercicios |
| `male.glb` | Cuerpo 3D |
| `lib/` | Three.js r147 y su cargador GLTF, para funcionar sin conexión |
| `sw.js` | Service worker: guarda la app en el celular y detecta versiones nuevas |
| `manifest.webmanifest`, `icons/` | Nombre, ícono y modo pantalla completa |
| `release.py` | Sube el número de versión |

## Créditos

Cuerpo 3D: [Universal Base Characters](https://quaternius.itch.io/universal-base-characters) de Quaternius (CC0, dominio público). Motor 3D: [Three.js](https://threejs.org) (MIT).
