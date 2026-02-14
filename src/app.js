import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const authCard = document.getElementById("authCard");
const authView = document.getElementById("authView");
const marketplaceView = document.getElementById("marketplaceView");
const profileView = document.getElementById("profileView");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginPanel = document.getElementById("loginPanel");
const registerPanel = document.getElementById("registerPanel");
const logoutButton = document.getElementById("logoutButton");
const profileButton = document.getElementById("profileButton");
const profileBackButton = document.getElementById("profileBackButton");
const profileForm = document.getElementById("profileForm");
const currentPlanInput = document.getElementById("currentPlanInput");
const avatarUploadInput = document.getElementById("avatarUpload");
const profileAvatarPreview = document.getElementById("profileAvatarPreview");
const headerAvatar = document.getElementById("headerAvatar");
const notificationsIndicator = document.getElementById("notificationsIndicator");
const chatIndicator = document.getElementById("chatIndicator");
const notificationsCount = document.getElementById("notificationsCount");
const chatCount = document.getElementById("chatCount");
const generateAvatarButton = document.getElementById("generateAvatarButton");
const chatView = document.getElementById("chatView");
const chatBackButton = document.getElementById("chatBackButton");
const chatMessages = document.getElementById("chatMessages");
const chatTitle = document.getElementById("chatTitle");
const chatContactName = document.getElementById("chatContactName");
const chatProductName = document.getElementById("chatProductName");
const chatProductPrice = document.getElementById("chatProductPrice");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
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
const marketplaceSubscriptionsButton = document.getElementById("marketplaceSubscriptionsButton");
const profileSubscriptionsButton = document.getElementById("profileSubscriptionsButton");
const subscriptionsBackButton = document.getElementById("subscriptionsBackButton");
const subscriptionsView = document.getElementById("subscriptionsView");
const topbarAuthCta = document.getElementById("topbarAuthCta");
const planSelectButtons = document.querySelectorAll(".plan-select-btn");

const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.content?.trim();
const supabaseAnonKey = document.querySelector('meta[name="supabase-anon-key"]')?.content?.trim();
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

let activeUser = null;
let selectedPlan = localStorage.getItem("kuoia:selectedPlan") || "Sin plan";
let profileAvatarData = localStorage.getItem("kuoia:profileAvatar") || "";
let activeChatProductId = null;
let unreadNotifications = 2;
let unreadChats = 0;

const chatMessagesByProduct = {
  p1: [
    { sender: "buyer", name: "Lucía · Colegio Mirador", text: "Hola, ¿el kit incluye guía para docentes?", time: "09:10" },
    { sender: "buyer", name: "Carlos · Familia", text: "¿Puedes enviar a Barcelona esta semana?", time: "09:18" },
  ],
  p2: [{ sender: "buyer", name: "Ainhoa · Docente", text: "Me interesa el banco de rúbricas para 1º ESO.", time: "10:02" }],
  p3: [{ sender: "buyer", name: "Mario · Centro Sol", text: "¿Las tutorías se pueden contratar por grupo?", time: "11:30" }],
  p4: [{ sender: "buyer", name: "Elena · AMPA", text: "¿Cuántos libros incluye el lote?", time: "12:05" }],
  p5: [{ sender: "buyer", name: "Noa · Cole Privado", text: "¿Está alineado con LOMLOE?", time: "12:34" }],
  p6: [{ sender: "buyer", name: "Javier · Infantil Luna", text: "¿Incluye piezas de reposición?", time: "13:15" }],
};

const checkSupabaseConnection = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { ok: false, message: "Falta configurar Supabase en index.html." };
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        apikey: supabaseAnonKey,
      },
    });

    if (!response.ok) {
      return { ok: false, message: `Supabase responde con estado ${response.status}.` };
    }

    return { ok: true, message: "Conexión con Supabase activa." };
  } catch (_error) {
    return { ok: false, message: "No se pudo conectar con Supabase. Revisa URL, key y red." };
  }
};

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

const createDefaultAvatar = (name = "") => {
  const clean = String(name || "Kuoia").trim();
  const initials = clean
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value[0]?.toUpperCase() || "")
    .join("") || "K";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#5c8ee0"/>
          <stop offset="100%" stop-color="#5cb4b5"/>
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="80" fill="url(#g)"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
        font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="58" font-weight="700" fill="#ffffff">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const updateAvatarUI = () => {
  const displayName = profileForm?.elements?.displayName?.value || activeUser?.email || "Kuoia";
  const avatar = profileAvatarData || createDefaultAvatar(displayName);

  if (profileAvatarPreview) profileAvatarPreview.src = avatar;
  if (headerAvatar) headerAvatar.src = avatar;
};
const updateIndicatorsUI = () => {
  if (notificationsCount) notificationsCount.textContent = String(unreadNotifications);
  if (chatCount) chatCount.textContent = String(unreadChats);

  notificationsIndicator?.classList.toggle("has-unread", unreadNotifications > 0);
  chatIndicator?.classList.toggle("has-unread", unreadChats > 0);
};

const clearChatUnread = () => {
  if (unreadChats === 0) return;
  unreadChats = 0;
  updateIndicatorsUI();
};

const registerIncomingChat = () => {
  unreadChats += 1;
  updateIndicatorsUI();
};


const renderChatMessages = () => {
  if (!chatMessages || !activeChatProductId) return;

  const messages = chatMessagesByProduct[activeChatProductId] || [];
  chatMessages.innerHTML = messages
    .map(
      (message) => `
      <article class="chat-bubble ${message.sender}">
        <small>${message.sender === "buyer" ? message.name : "Tú"} · ${message.time}</small>
        <p>${message.text}</p>
      </article>
    `,
    )
    .join("");

  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const openChat = (productId) => {
  const product = productCatalog.find((item) => item.id === productId);
  if (!product) return;

  activeChatProductId = product.id;
  const currentMessages = chatMessagesByProduct[product.id] || [];
  const firstBuyerName = currentMessages.find((message) => message.sender === "buyer")?.name || "Comprador interesado";

  if (chatTitle) chatTitle.textContent = "Chat de compradores";
  if (chatContactName) chatContactName.textContent = firstBuyerName;
  if (chatProductName) chatProductName.textContent = product.title;
  if (chatProductPrice) chatProductPrice.textContent = `${product.price} €`;

  authView.classList.add("hidden");
  marketplaceView.classList.add("hidden");
  subscriptionsView.classList.add("hidden");
  profileView.classList.add("hidden");
  chatView?.classList.remove("hidden");
  topbarAuthCta.classList.add("hidden");
  clearChatUnread();
  renderChatMessages();
};

const fillProfileForm = (user) => {
  if (!profileForm) return;
  const metadata = user?.user_metadata || {};
  const displayName = String(metadata.displayName || [metadata.firstName, metadata.lastName].filter(Boolean).join(" ").trim());

  profileForm.elements.displayName.value = displayName || "";
  profileForm.elements.role.value = metadata.identity || "particular";
  profileForm.elements.city.value = metadata.location || "";
  currentPlanInput.value = selectedPlan;
  updateAvatarUI();
};

const showAuthView = () => {
  authView.classList.remove("hidden");
  marketplaceView.classList.add("hidden");
  subscriptionsView.classList.add("hidden");
  profileView.classList.add("hidden");
  chatView?.classList.add("hidden");
  topbarAuthCta.classList.add("hidden");
};

const showSubscriptionsView = () => {
  authView.classList.add("hidden");
  marketplaceView.classList.add("hidden");
  subscriptionsView.classList.remove("hidden");
  profileView.classList.add("hidden");
  chatView?.classList.add("hidden");
  topbarAuthCta.classList.remove("hidden");
};

const showMarketplaceView = (user) => {
  activeUser = user;
  authView.classList.add("hidden");
  marketplaceView.classList.remove("hidden");
  subscriptionsView.classList.add("hidden");
  profileView.classList.add("hidden");
  chatView?.classList.add("hidden");
  topbarAuthCta.classList.add("hidden");
  updateAvatarUI();
  updateIndicatorsUI();

  const metadataName = [user?.user_metadata?.firstName, user?.user_metadata?.lastName].filter(Boolean).join(" ").trim();
  const displayName = String(user?.user_metadata?.displayName || "").trim();
  const fallback = user?.email || "tu cuenta";
  welcomeMessage.textContent = `Hola ${displayName || metadataName || fallback}, aquí tienes los productos en venta.`;

  updatePriceLabel();
  renderProducts();
};

const showProfileView = () => {
  authView.classList.add("hidden");
  marketplaceView.classList.add("hidden");
  subscriptionsView.classList.add("hidden");
  profileView.classList.remove("hidden");
  chatView?.classList.add("hidden");
  topbarAuthCta.classList.add("hidden");
  fillProfileForm(activeUser);
};

const persistSelectedPlan = (planName) => {
  selectedPlan = planName;
  localStorage.setItem("kuoia:selectedPlan", planName);
  if (currentPlanInput) currentPlanInput.value = planName;
};

loginTab.addEventListener("click", () => setActivePanel("login"));
registerTab.addEventListener("click", () => setActivePanel("register"));
marketplaceSubscriptionsButton?.addEventListener("click", showSubscriptionsView);
profileSubscriptionsButton?.addEventListener("click", showSubscriptionsView);
subscriptionsBackButton?.addEventListener("click", () => {
  if (activeUser) {
    showMarketplaceView(activeUser);
    return;
  }
  showAuthView();
});
profileButton?.addEventListener("click", showProfileView);
profileBackButton?.addEventListener("click", () => showMarketplaceView(activeUser));
chatBackButton?.addEventListener("click", () => showMarketplaceView(activeUser));
generateAvatarButton?.addEventListener("click", () => {
  const currentName = profileForm?.elements?.displayName?.value || activeUser?.email || "Kuoia";
  profileAvatarData = createDefaultAvatar(currentName);
  localStorage.setItem("kuoia:profileAvatar", profileAvatarData);
  updateAvatarUI();
  showToast("Avatar genérico creado.");
});
avatarUploadInput?.addEventListener("change", () => {
  const [file] = avatarUploadInput.files || [];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    profileAvatarData = String(reader.result || "");
    localStorage.setItem("kuoia:profileAvatar", profileAvatarData);
    updateAvatarUI();
    showToast("Imagen de perfil actualizada.");
  };
  reader.readAsDataURL(file);
});
topbarAuthCta?.addEventListener("click", () => {
  showAuthView();
  setActivePanel("login");
});
notificationsIndicator?.addEventListener("click", () => {
  unreadNotifications = 0;
  updateIndicatorsUI();
  showToast("Notificaciones revisadas.");
});

chatIndicator?.addEventListener("click", () => {
  if (unreadChats === 0) {
    showToast("No tienes chats pendientes.");
    return;
  }

  if (!activeChatProductId) {
    const [firstProductId] = Object.keys(chatMessagesByProduct);
    if (firstProductId) openChat(firstProductId);
  } else {
    openChat(activeChatProductId);
  }
});


planSelectButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const plan = button.dataset.plan;
    if (!plan) return;
    persistSelectedPlan(plan);
    showToast(`Plan ${plan} seleccionado correctamente.`);
  });
});

profileForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(profileForm);
  const displayName = String(formData.get("displayName") || "").trim();
  const [firstName, ...rest] = displayName.split(" ");

  if (activeUser) {
    activeUser = {
      ...activeUser,
      user_metadata: {
        ...activeUser.user_metadata,
        displayName,
        firstName: firstName || "",
        lastName: rest.join(" "),
        identity: String(formData.get("role") || "particular"),
        location: String(formData.get("city") || ""),
      },
    };
  }

  if (!profileAvatarData) {
    profileAvatarData = createDefaultAvatar(displayName || activeUser?.email || "Kuoia");
    localStorage.setItem("kuoia:profileAvatar", profileAvatarData);
  }

  showToast("Perfil de Kuoia actualizado.");
  showMarketplaceView(activeUser);
});

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

  if (action === "chat") {
    openChat(product.id);
    return;
  }

  const actionMessages = {
    buy: `Preparando compra de ${product.title}.`,
    save: `${product.title} se guardó en favoritos.`,
  };

  showToast(actionMessages[action] || "Acción ejecutada");
});

chatForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!activeChatProductId || !chatInput) return;

  const message = chatInput.value.trim();
  if (!message) return;

  if (!chatMessagesByProduct[activeChatProductId]) chatMessagesByProduct[activeChatProductId] = [];
  chatMessagesByProduct[activeChatProductId].push({
    sender: "self",
    name: "Tú",
    text: message,
    time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
  });

  renderChatMessages();
  chatForm.reset();

  window.setTimeout(() => {
    if (!activeChatProductId) return;

    chatMessagesByProduct[activeChatProductId].push({
      sender: "buyer",
      name: "Comprador interesado",
      text: "¡Gracias! Te confirmo en breve.",
      time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    });

    if (!chatView || chatView.classList.contains("hidden")) {
      registerIncomingChat();
      showToast("Tienes un nuevo mensaje de chat.");
      return;
    }

    renderChatMessages();
  }, 2200);
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

  const displayName = String(formData.get("displayName") || "").trim();
  const [firstName, ...rest] = displayName.split(" ").filter(Boolean);

  const profile = {
    displayName,
    firstName: firstName || "",
    lastName: rest.join(" "),
    identity: String(formData.get("identity") || "").trim(),
    location: "",
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
      showMarketplaceView(data.user);
      showToast("Cuenta creada. Activa tu email después, pero ya puedes explorar el inicio.");
      registerPanel.reset();
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

updateAvatarUI();
updateIndicatorsUI();

const connectionStatus = await checkSupabaseConnection();
if (!connectionStatus.ok) showToast(connectionStatus.message);

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
