# Kuoia

Marketplace educativo inspirado en modelos como Vinted y Wallapop, enfocado en la compra/venta de materiales y recursos para centros, docentes y familias.

## Qué incluye esta versión

- Diseño visual renovado (look limpio, elegante y moderno).
- Filtros dinámicos por búsqueda, etapa y categoría.
- Chips rápidos para filtrar por etapa en un clic.
- Ordenación por precio y valoración.
- Modal de detalle de producto, toast de feedback y login simulado.
- Modo oscuro con persistencia en `localStorage`.

## Ejecutar en local

```bash
python3 -m http.server 4173 --directory src
```

Luego abre `http://localhost:4173`.

## Deploy en Vercel

Este repositorio ya incluye `vercel.json` con rewrites para servir `src/index.html` en `/` y exponer los assets de `src/` correctamente en Vercel.

## Estructura

- `src/index.html`: estructura principal.
- `src/styles.css`: estilos, temas y responsive.
- `src/app.js`: catálogo de ejemplo y lógica dinámica.
- `vercel.json`: configuración de despliegue en Vercel.
