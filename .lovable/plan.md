# Mostrar el catálogo en la página de inicio

## Objetivo
Cuando un cliente entra en la web, después del hero verá el catálogo completo de productos (con buscador y agrupado por categoría) tal cual aparece en "Mis Pasteles". La sección "La historia de Yoli" se mantiene debajo.

## Cambios

### 1. Extraer el catálogo a un componente reutilizable
Crear `src/components/CatalogoPasteles.tsx` con la lógica actual de `src/routes/mis-pasteles.tsx`:
- Hook `useProducts()` + estado de búsqueda (`query`).
- `filteredByCategory` y `totalMatches` (mismo `useMemo`).
- Render del buscador y la cuadrícula por categoría con `<ProductCard>`.
- Aceptará props opcionales para personalizar el encabezado (título, subtítulo, eyebrow) para poder reutilizarlo en la home con un texto adecuado, o sin encabezado si se prefiere.

### 2. Actualizar `src/routes/mis-pasteles.tsx`
Sustituir el cuerpo por el nuevo `<CatalogoPasteles />` manteniendo el mismo encabezado actual ("Catálogo artesanal / Mis Pasteles / Todas las tartas…"). El resultado visual no cambia.

### 3. Actualizar `src/routes/index.tsx`
Reordenar las secciones para que queden así:
1. Hero (sin cambios).
2. **Nueva sección de catálogo**: `<CatalogoPasteles />` con encabezado breve adaptado a la home (p. ej. "Nuestro catálogo / Mis Pasteles / buscador + productos por categoría").
3. Historia de Yoli (sin cambios).
4. CTA secundario (sin cambios) — opcionalmente se puede mantener tal cual, ya que ahora el catálogo está visible arriba.

No se tocan precios, datos de producto, ni la lógica de `ProductCard`. Solo presentación/estructura de página.

## Verificación
- En `/` aparece el buscador y todos los productos agrupados por Tartas / Bizcochos / Dulces de Temporada, igual que en `/mis-pasteles`.
- El buscador filtra correctamente en la home.
- `/mis-pasteles` sigue funcionando idéntico.
- No hay errores de consola.
