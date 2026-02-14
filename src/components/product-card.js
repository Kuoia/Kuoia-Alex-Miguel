export const productCardHTML = (product, shape) => {
  const id = product[shape.map.id] ?? product.id;
  const title = product[shape.map.title] ?? "Sin título";
  const price = Number(product[shape.map.price] ?? 0);
  const description = product[shape.map.description] || "Sin descripción";
  const image = product[shape.map.image_url] || "https://placehold.co/600x400?text=Producto";

  return `
    <article class="market-card" data-product-id="${id}">
      <img src="${image}" alt="${title}" class="product-image" loading="lazy" />
      <div class="card-content">
        <div class="card-meta">
          <span class="tag">Listing</span>
          <span class="price">${price.toFixed(2)} €</span>
        </div>
        <h3>${title}</h3>
        <p>${description}</p>
        <div class="card-actions">
          <a class="action-btn" href="/products/${id}">Ver detalle</a>
        </div>
      </div>
    </article>
  `;
};
