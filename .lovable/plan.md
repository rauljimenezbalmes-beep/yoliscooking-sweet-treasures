## Objetivo
Añadir 3 botones de navegación rápida bajo el buscador de "Mis Pasteles" para saltar directamente a cada categoría: **Tartas**, **Bizcochos** y **Dulces de Temporada**.

## Cambios propuestos

### 1. `src/components/CatalogoPasteles.tsx`
- Añadir `id` único a cada `<section>` de categoría (ej. `id="cat-tartas"`, `id="cat-bizcochos"`, `id="cat-dulces-temporada"`).
- Bajo el buscador, añadir una fila de botones estilo píldora que, al hacer clic, hagan `scrollIntoView({ behavior: 'smooth', block: 'start' })` al `id` correspondiente.
- Mostrar solo los botones de categorías que tengan productos visibles (respetando el filtro de búsqueda actual).
- Ocultar los botones cuando el usuario esté escribiendo en el buscador (opcional, a determinar).

### 2. Estilo
- Botones con bordes redondeados, fondo sutil (ej. `bg-accent/40` o `bg-secondary/30`), texto pequeño/medium.
- Alinearlos centrados bajo el buscador con un pequeño gap.
- Estado hover sutil para feedback.

## Resultado esperado
El cliente entra en "Mis Pasteles", ve el buscador y justo debajo 3 botones claros. Al pulsar uno, la página desplaza suavemente hasta el inicio de esa categoría, facilitando la navegación cuando hay muchos productos.