## Objetivo

Añadir un configurador de pasteles para el **cliente final** como capa adicional sobre cada producto. El catálogo actual (`/mis-pasteles`) y la home se mantienen intactos: misma cuadrícula, imagen, nombre, precio, descripción.

## Principio clave

- **No se elimina ni reemplaza nada** del catálogo.
- La personalización vive en rutas nuevas por producto: `/pasteles/$id` (detalle) y `/pasteles/$id/personalizar` (configurador).
- Cada item del carrito guarda su propia configuración independiente.

## Cambios mínimos en lo existente

- `src/components/ProductCard.tsx`: el botón actual "Editar" (admin) se reemplaza por **"Ver pastel"** que enlaza a `/pasteles/$id`. La tarjeta entera también es clicable. Imagen, nombre, precio y descripción se mantienen exactamente igual.
- `src/components/SiteHeader.tsx`: añadir icono de **carrito** con badge de cantidad. Quitar el enlace "Gestionar pasteles" del nav público (la ruta `/admin/pasteles` sigue existiendo, sólo deja de promocionarse).
- Home (`src/routes/index.tsx`) y `/mis-pasteles`: sin cambios estructurales — solo el destino del botón de la tarjeta cambia.

## Rutas nuevas

```
/pasteles/$id              → Detalle del pastel
/pasteles/$id/personalizar → Configurador
/carrito                   → Resumen del carrito
```

Archivos:
- `src/routes/pasteles.$id.tsx`
- `src/routes/pasteles.$id.personalizar.tsx`
- `src/routes/carrito.tsx`

### Página de detalle `/pasteles/$id`

Muestra solo ESE pastel:
- Imagen grande
- Nombre, descripción larga, precio base
- Tamaños disponibles con porciones y precio orientativo
- Alérgenos (derivados de `ingredients`)
- Tiempo estimado de entrega (mínimo 3 días)
- CTA destacado: **"Personalizar mi pastel"** → `/pasteles/$id/personalizar`
- Link "Volver al catálogo"

### Configurador `/pasteles/$id/personalizar`

Una sola página, secciones apiladas con barra de progreso sticky (mejor UX móvil que un wizard de 10 pantallas). Resumen lateral sticky en desktop, barra inferior fija en móvil con total + CTA.

Secciones (validación con Zod, cada una desbloquea la siguiente):

1. **Sabores** (sólo si categoría es `Tartas` o `Bizcochos`) — chips, 1 ó 2 de:
   Crema pastelera, Yema quemada, Trufa, Chocolate blanco, Nocilla, Crema de pistacho, Crema Lotus, Nata, Crema de naranja.
2. **Cobertura** (radio único): Sin cobertura, Chocolate negro, Chocolate blanco, Almíbar de naranja, Almíbar de limón, Chocolate con leche.
3. **Tipo de decoración** — dos tarjetas:
   - *Clásica* — "La opción perfecta para los amantes de la estética más tradicional donde el protagonista principal es el sabor auténtico."
   - *Personalizada* — "Crea tu pastel a tu gusto y nosotros lo haremos realidad."
4. **Colores principales** *(sólo si personalizada)* — paleta predefinida + selector hex, 1 ó 2.
5. **Temática** *(sólo si personalizada)* — chips: Personajes, Animales, Fantasía, Tecnología, Deportes, Hobbies, Eventos, Estaciones del año.
6. **Descripción de la idea** *(sólo si personalizada)* — textarea con contador, máx 50 caracteres.
7. **Tamaño** — tarjetas: Individual, Pequeño, Mediano, Grande, Extra grande (con porciones y precio).
8. **Fecha de entrega** — Shadcn DatePicker, `disabled={{ before: hoy }}`, mínimo 3 días.
9. **Resumen + CTA "Pedir mi pastel"** → añade al carrito y navega a `/carrito`.

## Modelo de datos

Nuevo `src/data/customization.ts`:

```ts
export const FLAVORS = [...] as const;
export const COVERINGS = [...] as const;
export const THEMES = [...] as const;
export const SIZES = [
  { id:'individual', label:'Individual',   portions:1,  multiplier:0.4 },
  { id:'pequeno',    label:'Pequeño',      portions:6,  multiplier:1   },
  { id:'mediano',    label:'Mediano',      portions:10, multiplier:1.5 },
  { id:'grande',     label:'Grande',       portions:16, multiplier:2.2 },
  { id:'xl',         label:'Extra grande', portions:24, multiplier:3   },
] as const;
export const CUSTOM_DECORATION_FEE = 8; // €

export interface CakeCustomization {
  productId: string;
  flavors: string[];               // 0–2 (0 si "Tartas de Época")
  covering: string;
  decoration: 'clasica' | 'personalizada';
  colors?: string[];               // 1–2
  theme?: string;
  description?: string;            // ≤ 50
  sizeId: string;
  deliveryDate: string;            // ISO
}
```

## Precio dinámico

```
precio = producto.price * size.multiplier
       + (decoration === 'personalizada' ? CUSTOM_DECORATION_FEE : 0)
```

Se recalcula en tiempo real y se muestra en el resumen y junto al CTA.

## Carrito

Nuevo `src/data/cart-store.ts` (mismo patrón que `products-store.ts`: `useSyncExternalStore` + `localStorage`, clave `yoli.cart.v1`):

```ts
interface CartItem {
  id: string;            // uuid local
  customization: CakeCustomization;
  price: number;
  addedAt: number;
}
addToCart, removeFromCart, clearCart, useCart, useCartCount
```

Cada configuración se guarda como item independiente — el mismo pastel puede entrar varias veces con distintas personalizaciones.

Página `/carrito`: lista de items con resumen completo (sabores, cobertura, decoración, colores, temática, descripción, tamaño, fecha), botón eliminar, total, CTA "Continuar al pago" (placeholder con toast; queda preparado para Stripe + Lovable Cloud en futuro).

## Componentes nuevos

```
src/components/customization/
  ProgressBar.tsx
  StepFlavors.tsx
  StepCovering.tsx
  StepDecoration.tsx
  StepColors.tsx
  StepTheme.tsx
  StepDescription.tsx
  StepSize.tsx
  StepDelivery.tsx
  OrderSummary.tsx        (sticky desktop / barra inferior móvil)
src/components/CartIcon.tsx
src/components/CakeDetail.tsx
```

Shadcn ya disponibles: `calendar`, `popover`, `button`, `textarea`, `card`, `badge`. Si falta `checkbox`, se instala.

## SEO

- `/pasteles/$id`: title `"{nombre} — La Cocina De Yoli"`, og:image = imagen del producto.
- `/pasteles/$id/personalizar`: title `"Personaliza tu {nombre}"`, meta description con el flujo.
- `/carrito`: noindex.

## Responsive

- Móvil: secciones a ancho completo, resumen en barra inferior fija con total + CTA.
- Desktop: layout 2 columnas (configurador 2/3, resumen sticky 1/3).

## Fuera de alcance (futuro)

- Pago real (Stripe + Lovable Cloud).
- Persistencia en backend y datos del cliente (nombre, teléfono, dirección).
- Edición de un item ya en el carrito (por ahora se elimina y se vuelve a crear).
