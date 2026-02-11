# Kuoia

Marketplace educativo enfocado en la compra/venta de materiales y recursos para centros, docentes y familias.

## Qué incluye esta versión

- Inicio de sesión y registro real conectados a Supabase Auth.
- Persistencia de sesión para que, al entrar o registrarte, pases a la pantalla principal.
- Pantalla principal dinámica a pantalla completa con buscador y filtros por localidad, centro educativo, tipo y precio máximo.
- Cierre de sesión desde la pantalla principal.

## Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. En **Project Settings > API**, copia:
   - `Project URL`
   - `anon public key`
3. Abre `src/index.html` y completa:

```html
<meta name="supabase-url" content="TU_SUPABASE_URL" />
<meta name="supabase-anon-key" content="TU_SUPABASE_ANON_KEY" />
```

> Si quieres que al registrarse entren de inmediato, desactiva la confirmación por correo en `Authentication > Providers > Email` (o adapta el flujo según tu política de confirmación).

## Ejecutar en local

```bash
python3 -m http.server 4173 --directory src
```

Luego abre `http://localhost:4173`.

## Deploy en Vercel

Este repositorio incluye `vercel.json` con rewrites para servir `src/index.html` en `/` y exponer los assets de `src/` correctamente en Vercel.

## Estructura

- `src/index.html`: pantalla de acceso + pantalla principal.
- `src/styles.css`: estilos del login, registro y marketplace dinámico a pantalla completa.
- `src/app.js`: integración con Supabase Auth, filtros dinámicos y acciones de tarjetas (chat/comprar/guardar).
- `vercel.json`: configuración de despliegue.
