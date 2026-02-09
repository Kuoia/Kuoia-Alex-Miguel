const products = [
  {
    id: 1,
    name: "Kit STEAM para primaria",
    price: 120,
    stage: "primaria",
    category: "didactico",
    seller: "Colegio Verde",
    condition: "Como nuevo",
    rating: 4.9,
    location: "Madrid",
    description:
      "Incluye materiales de ciencias, fichas imprimibles y guías para 6 proyectos interdisciplinarios.",
  },
  {
    id: 2,
    name: "Biblioteca móvil infantil",
    price: 260,
    stage: "infantil",
    category: "mobiliario",
    seller: "AMPA Los Olivos",
    condition: "Buen estado",
    rating: 4.7,
    location: "Valencia",
    description:
      "Carro móvil con 80 libros ilustrados, ideal para rincones de lectura y proyectos de aula.",
  },
  {
    id: 3,
    name: "Tablets con control parental",
    price: 340,
    stage: "secundaria",
    category: "tecnologia",
    seller: "Centro Nova",
    condition: "Reacondicionado",
    rating: 4.6,
    location: "Sevilla",
    description:
      "Pack de 6 tablets con fundas reforzadas y software educativo preinstalado.",
  },
  {
    id: 4,
    name: "Pack de libros lectura compartida",
    price: 85,
    stage: "primaria",
    category: "libros",
    seller: "Profesora Ana",
    condition: "Como nuevo",
    rating: 4.8,
    location: "Bilbao",
    description:
      "Colección de 25 libros de lectura fácil con fichas de comprensión y club de lectura.",
  },
  {
    id: 5,
    name: "Kit sensorial inclusivo",
    price: 180,
    stage: "especial",
    category: "didactico",
    seller: "Fundación Integra",
    condition: "Nuevo",
    rating: 5.0,
    location: "Granada",
    description:
      "Recursos multisensoriales para aulas TEA, con tarjetas visuales y paneles táctiles.",
  },
  {
    id: 6,
    name: "Set arte sostenible",
    price: 95,
    stage: "bachillerato",
    category: "arte",
    seller: "IES Horizonte",
    condition: "Buen estado",
    rating: 4.5,
    location: "Zaragoza",
    description:
      "Materiales reutilizables para talleres de creatividad y proyectos de diseño circular.",
  },
];

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const stageSelect = document.getElementById("stageSelect");
const categorySelect = document.getElementById("categorySelect");
const minPriceInput = document.getElementById("minPrice");
const maxPriceInput = document.getElementById("maxPrice");
const resetFilters = document.getElementById("resetFilters");
const modal = document.getElementById("productModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const resultsCount = document.getElementById("resultsCount");
const sortSelect = document.getElementById("sortSelect");
const chipRow = document.getElementById("chipRow");

const savedKey = "kuoia_saved_products";
const quickTags = [
  "Robótica",
  "Necesidades especiales",
  "Aula sostenible",
  "Biblioteca",
  "Laboratorio",
];

const currency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const loadSaved = () => {
  const stored = localStorage.getItem(savedKey);
  return stored ? JSON.parse(stored) : [];
};

const updateSaved = (saved) => {
  localStorage.setItem(savedKey, JSON.stringify(saved));
};

const renderProducts = (items) => {
  const saved = loadSaved();
  productGrid.innerHTML = "";
  resultsCount.textContent = items.length;
  if (items.length === 0) {
    productGrid.innerHTML =
      "<div class='product-card'>No se encontraron productos con estos filtros.</div>";
    return;
  }

  items.forEach((product) => {
    const isSaved = saved.includes(product.id);
    const card = document.createElement("article");
    card.className = `product-card${product.rating >= 4.9 ? " highlight" : ""}`;
    card.innerHTML = `
      <div class="product-header">
        <span>${product.location}</span>
        <span class="badge">${product.condition}</span>
      </div>
      <div>
        <div class="product-title">${product.name}</div>
        <div class="product-meta">
          <span>${product.seller}</span>
          <span>★ ${product.rating}</span>
        </div>
      </div>
      <div class="product-price">${currency.format(product.price)}</div>
      <div class="product-actions">
        <button class="btn primary" data-id="${product.id}">Ver detalle</button>
        <button class="btn ghost${isSaved ? " active" : ""}" data-save="${product.id}">
          ${isSaved ? "Guardado" : "Guardar"}
        </button>
      </div>
    `;
    productGrid.appendChild(card);
  });
};

const sortItems = (items, sortValue) => {
  const sorted = [...items];
  switch (sortValue) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating-desc":
      return sorted.sort((a, b) => b.rating - a.rating);
    default:
      return sorted;
  }
};

const applyFilters = () => {
  const searchValue = searchInput.value.toLowerCase();
  const stageValue = stageSelect.value;
  const categoryValue = categorySelect.value;
  const minInput = Number(minPriceInput.value);
  const maxInput = Number(maxPriceInput.value);
  let minPrice = Number.isFinite(minInput) ? minInput : 0;
  let maxPrice = Number.isFinite(maxInput) ? maxInput : Number.POSITIVE_INFINITY;

  if (Number.isFinite(minInput) && Number.isFinite(maxInput) && maxInput < minInput) {
    minPrice = maxInput;
    maxPrice = minInput;
    minPriceInput.value = String(minPrice);
    maxPriceInput.value = String(maxPrice);
  }

  const filtered = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchValue) ||
      product.description.toLowerCase().includes(searchValue);
    const matchesStage = !stageValue || product.stage === stageValue;
    const matchesCategory = !categoryValue || product.category === categoryValue;
    const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
    return matchesSearch && matchesStage && matchesCategory && matchesPrice;
  });

  renderProducts(sortItems(filtered, sortSelect.value));
};

const openModal = (productId) => {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  modalBody.innerHTML = `
    <h2>${product.name}</h2>
    <p>${product.description}</p>
    <div class="product-meta">
      <span>Etapa: ${product.stage}</span>
      <span>Categoría: ${product.category}</span>
    </div>
    <div class="product-meta">
      <span>Ubicación: ${product.location}</span>
      <span>Vendedor: ${product.seller}</span>
    </div>
    <div class="product-price">${currency.format(product.price)}</div>
    <div class="hero-actions">
      <button class="btn primary">Comprar ahora</button>
      <button class="btn secondary">Contactar vendedor</button>
    </div>
  `;
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
};

const closeModalView = () => {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
};

productGrid.addEventListener("click", (event) => {
  const saveButton = event.target.closest("button[data-save]");
  if (saveButton) {
    const productId = Number(saveButton.dataset.save);
    const saved = loadSaved();
    const index = saved.indexOf(productId);
    if (index === -1) {
      saved.push(productId);
    } else {
      saved.splice(index, 1);
    }
    updateSaved(saved);
    applyFilters();
    return;
  }

  const detailButton = event.target.closest("button[data-id]");
  if (!detailButton) return;
  const productId = Number(detailButton.dataset.id);
  openModal(productId);
});

searchInput.addEventListener("input", applyFilters);
stageSelect.addEventListener("change", applyFilters);
categorySelect.addEventListener("change", applyFilters);
minPriceInput.addEventListener("input", applyFilters);
maxPriceInput.addEventListener("input", applyFilters);
sortSelect.addEventListener("change", applyFilters);

resetFilters.addEventListener("click", () => {
  searchInput.value = "";
  stageSelect.value = "";
  categorySelect.value = "";
  minPriceInput.value = "";
  maxPriceInput.value = "";
  sortSelect.value = "relevance";
  applyFilters();
});

closeModal.addEventListener("click", closeModalView);
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModalView();
  }
});

const renderChips = () => {
  chipRow.innerHTML = "";
  quickTags.forEach((tag) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = tag;
    chipRow.appendChild(chip);
  });
};

renderChips();
renderProducts(products);
