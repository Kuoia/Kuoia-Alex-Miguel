import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const authCard = document.getElementById("authCard");
const authView = document.getElementById("authView");
const marketplaceView = document.getElementById("marketplaceView");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginPanel = document.getElementById("loginPanel");
const registerPanel = document.getElementById("registerPanel");
const logoutButton = document.getElementById("logoutButton");
const searchInput = document.getElementById("searchInput");
const locationFilter = document.getElementById("locationFilter");
const centerFilter = document.getElementById("centerFilter");
const typeFilter = document.getElementById("typeFilter");
const priceRange = document.getElementById("priceRange");
const priceRangeValue = document.getElementById("priceRangeValue");
const welcomeMessage = document.getElementById("welcomeMessage");
const resultsMeta = document.getElementById("resultsMeta");
const marketplaceGrid = document.getElementById("marketplaceGrid");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");
const networkCanvas = document.getElementById("networkCanvas");

const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.content?.trim();
const supabaseAnonKey = document.querySelector('meta[name="supabase-anon-key"]')?.content?.trim();
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const productCatalog = [
  {
    id: "p1",
    title: "Kit STEM para primaria",
    description: "Material práctico para experimentos guiados en aula de 3º a 6º.",
    image: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=80",
    location: "madrid",
    centerType: "concertado",
    type: "producto",
    price: 120,
    rating: 4.8,
  },
  {
    id: "p2",
    title: "Banco de rúbricas descargables",
    description: "Plantillas listas para evaluar proyectos por competencias.",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=80",
    location: "barcelona",
    centerType: "publico",
    type: "recurso",
    price: 45,
    rating: 4.6,
  },
  {
    id: "p3",
    title: "Tutorías de refuerzo en matemáticas",
    description: "Sesiones online personalizadas para ESO y Bachillerato.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80",
    location: "valencia",
    centerType: "privado",
    type: "servicio",
    price: 32,
    rating: 4.9,
  },
  {
    id: "p4",
    title: "Lote de libros juveniles",
    description: "Colección en perfecto estado para biblioteca escolar.",
    image: "https://images.unsplash.com/photo-1455885666463-9a9d53d6f438?auto=format&fit=crop&w=900&q=80",
    location: "sevilla",
    centerType: "publico",
    type: "producto",
    price: 65,
    rating: 4.4,
  },
  {
    id: "p5",
    title: "Programación anual editable",
    description: "Documento completo con objetivos, competencias y evidencias.",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=80",
    location: "madrid",
    centerType: "privado",
    type: "recurso",
    price: 25,
    rating: 4.7,
  },
  {
    id: "p6",
    title: "Armario de material Montessori",
    description: "Set de piezas y paneles sensoriales para infantil.",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=80",
    location: "barcelona",
    centerType: "concertado",
    type: "producto",
    price: 240,
    rating: 4.5,
  },
];

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
};

const typeLabels = {
  producto: "Producto",
  recurso: "Recurso",
  servicio: "Servicio",
};

const centerLabels = {
  publico: "Público",
  concertado: "Concertado",
  privado: "Privado",
};

const normalize = (value) => String(value || "").toLowerCase();

const getFilteredProducts = () => {
  const query = normalize(searchInput.value).trim();
  const location = normalize(locationFilter.value);
  const center = normalize(centerFilter.value);
  const type = normalize(typeFilter.value);
  const maxPrice = Number(priceRange.value);

  return productCatalog.filter((item) => {
    const haystack = normalize(
      `${item.title} ${item.description} ${item.location} ${item.centerType} ${item.type}`,
    );

    const matchQuery = !query || haystack.includes(query);
    const matchLocation = !location || item.location === location;
    const matchCenter = !center || item.centerType === center;
    const matchType = !type || item.type === type;
    const matchPrice = item.price <= maxPrice;

    return matchQuery && matchLocation && matchCenter && matchType && matchPrice;
  });
};

const renderProducts = () => {
  const filteredProducts = getFilteredProducts();

  marketplaceGrid.innerHTML = filteredProducts
    .map(
      (item) => `
      <article class="market-card" data-id="${item.id}">
        <img src="${item.image}" alt="${item.title}" class="product-image" loading="lazy" />
        <div class="card-content">
          <div class="card-meta">
            <span class="tag">${typeLabels[item.type] || item.type}</span>
            <span class="price">${item.price} €</span>
          </div>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <p class="details">${item.location[0].toUpperCase() + item.location.slice(1)} · Centro ${centerLabels[item.centerType] || item.centerType}</p>
          <p class="rating">⭐ ${item.rating.toFixed(1)}</p>
          <div class="card-actions">
            <button type="button" class="action-btn" data-action="chat" data-id="${item.id}">Chat</button>
            <button type="button" class="action-btn buy" data-action="buy" data-id="${item.id}">Comprar</button>
            <button type="button" class="action-btn" data-action="save" data-id="${item.id}">Guardar</button>
          </div>
        </div>
      </article>
    `,
    )
    .join("");

  resultsMeta.textContent = `Mostrando ${filteredProducts.length} de ${productCatalog.length} resultados.`;
  emptyState.classList.toggle("hidden", filteredProducts.length !== 0);
};

const updatePriceLabel = () => {
  priceRangeValue.textContent = `Hasta ${priceRange.value} €`;
};

const setActivePanel = (panel) => {
  const isLogin = panel === "login";
  loginTab.classList.toggle("active", isLogin);
  loginTab.setAttribute("aria-selected", String(isLogin));
  registerTab.classList.toggle("active", !isLogin);
  registerTab.setAttribute("aria-selected", String(!isLogin));
  loginPanel.classList.toggle("active", isLogin);
  loginPanel.hidden = !isLogin;
  registerPanel.classList.toggle("active", !isLogin);
  registerPanel.hidden = isLogin;
  authCard.classList.toggle("register-mode", !isLogin);
};

const showAuthView = () => {
  authView.classList.remove("hidden");
  marketplaceView.classList.add("hidden");
};

const showMarketplaceView = (user) => {
  authView.classList.add("hidden");
  marketplaceView.classList.remove("hidden");

  const fullName = [user?.user_metadata?.firstName, user?.user_metadata?.lastName].filter(Boolean).join(" ").trim();
  const fallback = user?.email || "tu cuenta";
  welcomeMessage.textContent = `Hola ${fullName || fallback}, aquí tienes un inicio dinámico de pantalla completa.`;

  updatePriceLabel();
  renderProducts();
};

loginTab.addEventListener("click", () => setActivePanel("login"));
registerTab.addEventListener("click", () => setActivePanel("register"));

[searchInput, locationFilter, centerFilter, typeFilter].forEach((input) => {
  input.addEventListener("input", renderProducts);
  input.addEventListener("change", renderProducts);
});

priceRange.addEventListener("input", () => {
  updatePriceLabel();
  renderProducts();
});

marketplaceGrid.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  const action = target.dataset.action;
  const id = target.dataset.id;
  const product = productCatalog.find((item) => item.id === id);
  if (!product || !action) return;

  const actionMessages = {
    chat: `Abriendo chat para ${product.title}.`,
    buy: `Preparando compra de ${product.title}.`,
    save: `${product.title} se guardó en favoritos.`,
  };

  showToast(actionMessages[action] || "Acción ejecutada");
});

loginPanel.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!supabase) {
    showToast("Configura supabase-url y supabase-anon-key en index.html.");
    return;
  }

  const formData = new FormData(loginPanel);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    showToast(error?.message || "No fue posible iniciar sesión.");
    return;
  }

  showMarketplaceView(data.user);
  showToast("Inicio de sesión exitoso ✨");
  loginPanel.reset();
});

registerPanel.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!supabase) {
    showToast("Configura supabase-url y supabase-anon-key en index.html.");
    return;
  }

  const formData = new FormData(registerPanel);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const profile = {
    firstName: String(formData.get("firstName") || "").trim(),
    lastName: String(formData.get("lastName") || "").trim(),
    identity: String(formData.get("identity") || "").trim(),
    location: String(formData.get("location") || "").trim(),
  };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: profile,
    },
  });

  if (error) {
    showToast(error.message);
    return;
  }

  if (data.user) {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !signInData.user) {
      showToast("Cuenta creada. Si activaste confirmación por email, valida tu correo para entrar.");
      setActivePanel("login");
      return;
    }

    showMarketplaceView(signInData.user);
    showToast("Usuario creado correctamente ✨");
    registerPanel.reset();
  }
});

logoutButton.addEventListener("click", async () => {
  if (supabase) await supabase.auth.signOut();
  showAuthView();
  showToast("Sesión cerrada.");
  setActivePanel("login");
});

if (supabase) {
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      showMarketplaceView(session.user);
      return;
    }
    showAuthView();
  });

  const { data } = await supabase.auth.getSession();
  if (data.session?.user) showMarketplaceView(data.session.user);
  else showAuthView();
} else {
  showAuthView();
  showToast("Agrega tus credenciales de Supabase para habilitar autenticación real.");
}

if (authCard) {
  const damp = (value, amount = 15) => value / amount;

  document.addEventListener("mousemove", (event) => {
    const { innerWidth, innerHeight } = window;
    const xRatio = event.clientX / innerWidth - 0.5;
    const yRatio = event.clientY / innerHeight - 0.5;
    authCard.style.transform = `rotateX(${damp(-yRatio * 8)}deg) rotateY(${damp(xRatio * 10)}deg)`;
  });

  document.addEventListener("mouseleave", () => {
    authCard.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}

if (networkCanvas) {
  const ctx = networkCanvas.getContext("2d");
  let width = 0;
  let height = 0;
  const mouse = { x: -9999, y: -9999, active: false };
  const nodeCount = 44;
  const linkDistance = 210;

  const typeColors = {
    colegio: "rgba(74, 150, 178, 0.86)",
    familia: "rgba(77, 128, 187, 0.86)",
    producto: "rgba(88, 171, 164, 0.86)",
  };

  const labels = ["colegio", "familia", "producto"];

  const nodes = Array.from({ length: nodeCount }, (_, index) => {
    const kind = labels[index % labels.length];
    return {
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 2.4 + Math.random() * 1.2,
      kind,
      pulse: Math.random() * Math.PI * 2,
    };
  });

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    networkCanvas.width = Math.floor(width * dpr);
    networkCanvas.height = Math.floor(height * dpr);
    networkCanvas.style.width = `${width}px`;
    networkCanvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    nodes.forEach((node) => {
      if (!node.x || !node.y) {
        node.x = Math.random() * width;
        node.y = Math.random() * height;
      }
    });
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < linkDistance) {
          const opacity = (1 - dist / linkDistance) * 0.62;
          ctx.strokeStyle = `rgba(94, 151, 188, ${opacity})`;
          ctx.lineWidth = 1.05;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((node) => {
      node.pulse += 0.028;
      const pulseRadius = node.radius + Math.sin(node.pulse) * 0.32;
      ctx.fillStyle = typeColors[node.kind];
      ctx.beginPath();
      ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = "rgba(165, 208, 213, 0.62)";
      ctx.lineWidth = 1;
      ctx.arc(node.x, node.y, pulseRadius + 2.3, 0, Math.PI * 2);
      ctx.stroke();
    });
  };

  const update = () => {
    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x <= 0 || node.x >= width) node.vx *= -1;
      if (node.y <= 0 || node.y >= height) node.vy *= -1;

      if (mouse.active) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 150 && dist > 0.001) {
          const force = (150 - dist) / 150;
          node.vx -= (dx / dist) * force * 0.02;
          node.vy -= (dy / dist) * force * 0.02;
        }
      }

      node.vx *= 0.993;
      node.vy *= 0.993;

      if (node.vx > 0.4) node.vx = 0.4;
      if (node.vx < -0.4) node.vx = -0.4;
      if (node.vy > 0.4) node.vy = 0.4;
      if (node.vy < -0.4) node.vy = -0.4;
    });
  };

  const animate = () => {
    update();
    draw();
    requestAnimationFrame(animate);
  };

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
  });
  window.addEventListener("mouseout", () => {
    mouse.active = false;
  });

  resize();
  animate();
}
