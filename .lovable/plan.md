## Contexto
En la pagina de detalle de cada pastel (`pasteles/$id`) ya aparece "Desde X €" como precio orientativo. Sin embargo, en el catalogo publico (`mis-pasteles`) las tarjetas de producto muestran solo el numero de precio sin la palabra "Desde".

## Cambio propuesto
Anadir la palabra **"Desde"** delante del precio en las tarjetas del catalogo para que el cliente entienda que es un precio base y puede variar segun personalizacion.

## Archivos a modificar
1. `src/components/ProductCard.tsx`
   - Linea 40: cambiar `{product.price.toFixed(2)} €` por `Desde {product.price.toFixed(2)} €`

## Fuera de alcance
- Lista de admin (`CakeList.tsx`): ahi se muestran precios base exactos de productos, no precios orientativos para clientes. No se modifica.