const products = [
  {
    id: 1,
    name: "Kit STEAM robótica inicial",
    price: 240,
    stage: "primaria",
    category: "tecnologia",
    seller: "Colegio San Rafael",
    condition: "Excelente",
    rating: 4.9,
    location: "Madrid",
    description: "Incluye placas programables, sensores básicos y guías didácticas para iniciar proyectos de robótica.",
  },
  {
    id: 2,
    name: "Mobiliario flexible aula activa",
    price: 520,
    stage: "secundaria",
    category: "mobiliario",
    seller: "IES Nova Aula",
    condition: "Buen estado",
    rating: 4.6,
    location: "Valencia",
    description: "Conjunto de mesas modulares y taburetes ergonómicos para metodologías colaborativas.",
  },
  {
    id: 3,
    name: "Tablets educativas (pack x6)",
    price: 780,
    stage: "infantil",
    category: "tecnologia",
    seller: "Academia Mentes",
    condition: "Reacondicionado",
    rating: 4.7,
    location: "Sevilla",
    description: "Pack de 6 tablets con fundas reforzadas y software educativo preinstalado.",
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
    description: "Colección de 25 libros de lectura fácil con fichas de comprensión y club de lectura.",
  },
  {
    id: 5,
    name: "Kit sensorial inclusivo",
    price: 180,
    stage: "especial",
    category: "didactico",
    seller: "Fundación Integra",
    condition: "Nuevo",
    rating: 5,
    location: "Granada",
    description: "Recursos multisensoriales para aulas TEA, con tarjetas visuales y paneles táctiles.",
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
    description: "Materiales reutilizables para talleres de creatividad y proyectos de diseño circular.",
  },
];

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const stageSelect = document.getElementById("stageSelect");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");
const resetFilters = document.getElementById("resetFilters");
const resultCount = document.getElementById("resultCount");
const quickFilters = document.getElementById("quickFilters");
const modal = document.getElementById("productModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const loginForm = document.getElementById("loginForm");
const themeToggle = document.getElementById("themeToggle");
const toast = document.getElementById("toast");

const currency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1900);
};

const updateResultsLabel = (total) => {
  resultCount.textContent = `${total} ${total === 1 ? "resultado" : "resultados"}`;
};

const getSortedProducts = (list) => {
  const sorted = [...list];
  switch (sortSelect.value) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    default:
      sorted.sort((a, b) => b.rating - a.rating);
      break;
  }
  return sorted;
};

const renderProducts = (items) => {
  productGrid.innerHTML = "";
  if (!items.length) {
    productGrid.innerHTML =
      "<article class='empty-state'><h3>Sin resultados</h3><p>Prueba combinando otros filtros o limpiando la búsqueda.</p></article>";
    updateResultsLabel(0);
    return;
  }

  updateResultsLabel(items.length);

  items.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-header">
        <span>${product.location}</span>
        <span class="badge">${product.condition}</span>
      </div>
      <div>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-meta">
          <span>${product.seller}</span>
          <span>★ ${product.rating.toFixed(1)}</span>
        </p>
      </div>
      <p class="product-price">${currency.format(product.price)}</p>
      <div class="product-actions">
        <button class="btn primary" data-id="${product.id}" type="button">Ver detalle</button>
        <button class="btn ghost" data-save="${product.id}" type="button">Guardar</button>
      </div>
    `;
    productGrid.appendChild(card);
  });
};

const applyFilters = () => {
  const searchValue = searchInput.value.trim().toLowerCase();
  const stageValue = stageSelect.value;
  const categoryValue = categorySelect.value;

  const filtered = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchValue) ||
      product.description.toLowerCase().includes(searchValue) ||
      product.seller.toLowerCase().includes(searchValue);

    const matchesStage = !stageValue || product.stage === stageValue;
    const matchesCategory = !categoryValue || product.category === categoryValue;
    return matchesSearch && matchesStage && matchesCategory;
  });

  renderProducts(getSortedProducts(filtered));
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
    <p class="product-price">${currency.format(product.price)}</p>
    <div class="hero-actions">
      <button class="btn primary" type="button">Comprar ahora</button>
      <button class="btn secondary" type="button">Contactar vendedor</button>
    </div>
  `;

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
};

const closeModalView = () => {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
};

const setActiveQuickChip = (stage) => {
  const chips = quickFilters.querySelectorAll(".chip");
  chips.forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.stage === stage);
  });
};

quickFilters.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (!chip) return;
  const stage = chip.dataset.stage;
  stageSelect.value = stage;
  setActiveQuickChip(stage);
  applyFilters();
});

productGrid.addEventListener("click", (event) => {
  const detailButton = event.target.closest("button[data-id]");
  const saveButton = event.target.closest("button[data-save]");

  if (detailButton) {
    openModal(Number(detailButton.dataset.id));
    return;
  }

  if (saveButton) {
    showToast("Producto guardado en tu lista ✨");
  }
});

searchInput.addEventListener("input", applyFilters);
stageSelect.addEventListener("change", () => {
  setActiveQuickChip(stageSelect.value);
  applyFilters();
});
categorySelect.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);

resetFilters.addEventListener("click", () => {
  searchInput.value = "";
  stageSelect.value = "";
  categorySelect.value = "";
  sortSelect.value = "featured";
  setActiveQuickChip("");
  applyFilters();
  showToast("Filtros restablecidos");
});

closeModal.addEventListener("click", closeModalView);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModalView();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModalView();
  }
});

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showToast("Acceso simulado correctamente ✅");
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("kuoia-theme", isDark ? "dark" : "light");
  });

  const storedTheme = localStorage.getItem("kuoia-theme");
  if (storedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }
}

const counterElements = document.querySelectorAll("[data-counter]");
counterElements.forEach((counter) => {
  const target = Number(counter.dataset.counter);
  const increment = target / 35;
  let current = 0;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      clearInterval(timer);
      if (target < 10) {
        counter.textContent = `${target.toFixed(1)}/5`;
      } else if (target >= 1000) {
        counter.textContent = `${(target / 1000).toFixed(1)}K`;
      } else {
        counter.textContent = Math.round(target).toString();
      }
      return;
    }

    if (target < 10) {
      counter.textContent = `${current.toFixed(1)}/5`;
    } else if (target >= 1000) {
      counter.textContent = `${(current / 1000).toFixed(1)}K`;
    } else {
      counter.textContent = Math.round(current).toString();
    }
  }, 26);
});

document.getElementById("currentYear").textContent = new Date().getFullYear();
applyFilters();
