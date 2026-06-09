## Problema real

El carrito se rompe con "This page didn't load" porque `format(new Date(deliveryDate), …)` en `src/routes/carrito.tsx:141` lanza `RangeError: Invalid time value` cuando `deliveryDate` queda como string vacío (puede pasar si el paso "Detalles" se salta o se construye el item sin fecha válida). Esto hace que el cliente nunca pueda llegar al carrito a revisar/pagar lo que añadió.

Además, hoy el carrito vive solo en `localStorage` (`yoli.cart.v1`), así que se pierde al cambiar de navegador o dispositivo. El usuario quiere que esté **vinculado a la cuenta**.

## Cambios

### 1. Arreglar el render del carrito (`src/routes/carrito.tsx`)
- Añadir helper `formatDeliveryDate(value)` que valida con `isNaN(d.getTime())` y devuelve "Sin fecha" si no es válida; sustituir la llamada actual a `format`.
- Sanitizar opcionalmente al cargar: si `it.customization.deliveryDate` no es parseable, mostrar el aviso pero no crashear.

### 2. Asegurar fecha válida al añadir (`src/routes/pasteles.$id.personalizar.tsx`)
- En `handleNext` (último paso), si `state.deliveryDate` está vacío, no añadir y mostrar un toast pidiendo completar la fecha. El paso "Detalles" ya valida `minDeliveryOk`, pero blindamos también el `addToCart`.

### 3. Persistencia vinculada a la cuenta (Lovable Cloud)
Nueva tabla `public.cart_items` con:
- `user_id uuid` (FK lógica a `auth.users`, no FK física), `customization jsonb`, `price numeric`, `added_at timestamptz`
- RLS: cada usuario ve/modifica solo sus filas (`auth.uid() = user_id`)
- GRANTs a `authenticated` y `service_role`

Modificar `src/data/cart-store.ts`:
- Mantener el store reactivo actual (useSyncExternalStore) y `localStorage` como caché offline/invitado.
- Al cargar la app, si hay sesión: leer `cart_items` del usuario y reemplazar el estado; suscribirse a `onAuthStateChange` para resincronizar al iniciar/cerrar sesión.
- `addToCart` / `removeFromCart` / `clearCart`: si hay sesión, escribir también en Supabase (insert/delete) usando el cliente del navegador con RLS. Si no hay sesión, seguir solo en localStorage.
- Al iniciar sesión por primera vez con items locales, hacer "merge": subir los items locales a la tabla y luego recargar desde la nube.

### 4. UX en `/carrito`
- Si el usuario no está autenticado, mostrar un aviso suave arriba: "Inicia sesión para guardar tu carrito en tu cuenta" con link a `/auth`. No bloquear el uso.
- "Continuar al pago" sigue mostrando el toast "Próximamente" (fuera de alcance: pagos reales).

## Fuera de alcance
- Integración real de pago.
- Edición de un item ya en el carrito (solo eliminar/añadir nuevo).
- Cambios en el wizard de pasos o en el admin.

## Detalles técnicos

- Cliente Supabase del navegador: `@/integrations/supabase/client` (RLS aplica como el usuario).
- No se usa `createServerFn` ni `client.server`: el carrito es del propio usuario y RLS basta.
- Migración crea la tabla con la estructura GRANT → RLS → POLICY estándar.
