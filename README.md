# Kuoia

Marketplace educativo enfocado en la compra/venta de materiales y recursos para centros, docentes y familias.

## Qué incluye esta versión

- Inicio de sesión y registro real conectados a Supabase Auth.
- Persistencia de sesión para que, al entrar o registrarte, pases a la pantalla principal.
- Pantalla principal dinámica a pantalla completa con buscador y filtros por localidad, centro educativo, tipo y precio máximo.
- Cierre de sesión desde la pantalla principal.


## Nota sobre el tipo de proyecto

Esta app **no usa Next.js ni React** en esta versión. Es una web estática con:

- `src/index.html`
- `src/styles.css`
- `src/app.js`

Puedes desplegarla en Vercel sin problema porque `vercel.json` ya enruta la raíz a `src/index.html`.

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


## Verificar que Supabase está activa

1. Arranca la app local:

```bash
python3 -m http.server 4173 --directory src
```

2. Abre `http://localhost:4173`.
3. Si la conexión con Supabase está bien, podrás crear usuario/iniciar sesión.
4. Si hay fallo de conexión, la app mostrará un aviso (`toast`) con el estado de error para ayudarte a corregir URL o key.

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

## Chat setup

Esta versión incluye chat 1:1 en tiempo real con Supabase Realtime sobre la tabla `messages`.

### Variables necesarias

Mantén configuradas en cliente:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> En este repo estático se consumen desde `<meta>` en `src/index.html` (`supabase-url` y `supabase-anon-key`).

### Requisitos de base de datos

- Tablas existentes: `conversations`, `conversation_participants`, `messages`.
- RLS habilitado (sin cambios en policies).
- Realtime habilitado en `messages`.
- Para "Nuevo chat por email":
  - O bien tabla `profiles` con columnas `id` (uuid de auth user) y `email`, accesible por RLS.
  - O bien RPC `find_user_by_email(user_email text)` en servidor.

### Cómo probar localmente

1. Ejecuta servidor estático:

```bash
python3 -m http.server 4173 --directory src
```

2. Abre `http://localhost:4173`.
3. Inicia sesión con dos usuarios distintos en dos navegadores.
4. Entra en **Chats** (`/chats`), crea conversación por email y envía mensajes.
5. Verifica recepción en tiempo real (sin recargar).
