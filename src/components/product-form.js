export const fillProductForm = (form, product, shape) => {
  if (!form || !product) return;
  form.elements.title.value = product[shape.map.title] || "";
  form.elements.description.value = product[shape.map.description] || "";
  form.elements.price.value = product[shape.map.price] ?? "";
};
