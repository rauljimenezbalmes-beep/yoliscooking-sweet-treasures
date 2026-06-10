# Arreglar "Pastel no encontrado" al abrir un producto

## Problema

Al hacer clic en un pastel, la nueva página muestra "Pastel no encontrado", aunque el producto sí existe.

**Causa:** en `src/routes/pasteles.$id.index.tsx`, el componente hace:

```tsx
const product = useProduct(id);
if (!product) throw notFound();
```

`useProduct` está basado en React Query y carga los productos de la base de datos de forma asíncrona. En el primer render `product` siempre es `undefined`, así que se lanza `notFound()` antes de que la consulta termine.

## Solución

Distinguir entre "todavía cargando" y "realmente no existe":

1. En `src/data/products-store.ts`, exponer también el estado de carga de la consulta — añadir un hook `useProductsQuery()` (o devolver `{ data, isLoading }`) sin romper `useProducts()` actual.
2. En `src/routes/pasteles.$id.index.tsx`:
   - Usar el nuevo hook para saber si los productos aún se están cargando.
   - Si `isLoading` → mostrar un esqueleto/spinner simple (no lanzar `notFound`).
   - Si ya cargó y el producto no existe → entonces sí `throw notFound()`.
3. Revisar `src/routes/pasteles.$id.personalizar.tsx` y aplicar el mismo patrón si hace la misma comprobación.
4. Asegurar que la ruta tenga `notFoundComponent` (ya existe en `pasteles.$id.index.tsx`).

## Resultado esperado

Al abrir un pastel, la página muestra brevemente un estado de carga y luego el detalle del producto. Solo aparecerá "Pastel no encontrado" si el id realmente no existe.
