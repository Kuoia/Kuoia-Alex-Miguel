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

## Listings / Products (Supabase `public.products`)

Esta versión añade flujo completo de listings dentro de la SPA:

- `/products`: listado público para usuarios autenticados.
- `/products/:id`: detalle de producto + botón **Contactar** (redirige al módulo de chats como integración base).
- `/sell`: formulario para crear producto.
- `/my-products`: mis productos (filtrados por ownership).
- `/my-products/:id/edit`: edición de producto.

### Variables de entorno recomendadas en Vercel

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> No uses `SUPABASE_SERVICE_ROLE_KEY` en cliente.
> En esta implementación actual no se usa service role.

### Nota sobre ownership + RLS

La app asume columna de ownership tipo `user_id` (o equivalente detectado por alias: `owner_id`, `seller_id`, `author_id`).

Si faltaran policies de ownership para editar/borrar, SQL sugerido (NO aplicado automáticamente por la app):

```sql
-- Update own products
create policy "users_can_update_own_products"
on public.products
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Delete own products
create policy "users_can_delete_own_products"
on public.products
for delete
to authenticated
using (auth.uid() = user_id);
```
