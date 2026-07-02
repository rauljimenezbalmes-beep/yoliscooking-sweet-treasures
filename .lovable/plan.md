Limitar el catálogo para mostrar solo los 4 primeros productos de cada categoría inicialmente, y añadir un botón "Ver más productos" junto a cada título de categoría que expanda para mostrar el resto.

Cambios en `src/components/CatalogoPasteles.tsx`:

- Añadir estado local con `useState<Record<string, boolean>>` para rastrear qué categorías están expandidas.
- Por cada categoría, renderizar únicamente los primeros 4 productos si la categoría no está expandida; si está expandida, mostrar todos.
- Modificar el encabezado de cada categoría para incluir, alineado a la derecha del título, un botón pequeño con estilo outline que diga "Ver más productos". Usar `flex items-center justify-between` en la fila del título.
- El botón actualiza el estado local para expandir la categoría correspondiente. Una vez expandida, el botón puede desaparecer o cambiar a "Ver menos"; mostrar solo "Ver más productos" y ocultarlo cuando todo esté visible es suficiente.
- El botón no necesita navegar ni tocar la base de datos: es puro comportamiento de UI local.