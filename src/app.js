import { getSupabaseClient, getSupabaseConfig } from "./lib/supabase/client.js";
import { productCardHTML } from "./components/product-card.js";
import { fillProductForm } from "./components/product-form.js";
import {
  buildCreatePayload,
  createProduct,
  deleteProduct,
  getProduct,
  inferProductShape,
  listMyProducts,
  listProducts,
  updateProduct,
  validateProductInput,
} from "./lib/products.js";
import {
  findUserIdByEmail,
  formatChatDate,
  getConversationMessages,
  getOrCreateConversation,
  isConversationParticipant,
  listConversationsForUser,
  sendConversationMessage,
} from "./lib/chat.js";

const authCard = document.getElementById("authCard");
const authView = document.getElementById("authView");
const marketplaceView = document.getElementById("marketplaceView");
const uploadProductView = document.getElementById("uploadProductView");
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
const chatRegistryButton = document.getElementById("chatRegistryButton");
const chatRegistryView = document.getElementById("chatRegistryView");
const chatRegistryBackButton = document.getElementById("chatRegistryBackButton");
const chatRegistryList = document.getElementById("chatRegistryList");
const newChatForm = document.getElementById("newChatForm");
const newChatEmail = document.getElementById("newChatEmail");
const chatRegistryStatus = document.getElementById("chatRegistryStatus");
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
const chatDetailStatus = document.getElementById("chatDetailStatus");
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
const uploadProductButton = document.getElementById("uploadProductButton");
const uploadProductBackButton = document.getElementById("uploadProductBackButton");
const uploadProductForm = document.getElementById("uploadProductForm");
const profileSubscriptionsButton = document.getElementById("profileSubscriptionsButton");
const subscriptionsBackButton = document.getElementById("subscriptionsBackButton");
const subscriptionsView = document.getElementById("subscriptionsView");
const topbarAuthCta = document.getElementById("topbarAuthCta");
const planSelectButtons = document.querySelectorAll(".plan-select-btn");

const browseProductsButton = document.getElementById("browseProductsButton");
const myProductsButton = document.getElementById("myProductsButton");
const productDetailView = document.getElementById("productDetailView");
const productDetailTitle = document.getElementById("productDetailTitle");
const productDetailBody = document.getElementById("productDetailBody");
const productDetailBackButton = document.getElementById("productDetailBackButton");
const contactOwnerButton = document.getElementById("contactOwnerButton");
const myProductsView = document.getElementById("myProductsView");
const myProductsGrid = document.getElementById("myProductsGrid");
const myProductsStatus = document.getElementById("myProductsStatus");
const myProductsBackButton = document.getElementById("myProductsBackButton");
const editProductView = document.getElementById("editProductView");
const editProductForm = document.getElementById("editProductForm");
const editProductBackButton = document.getElementById("editProductBackButton");

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();
const supabase = getSupabaseClient();

let activeUser = null;
let selectedPlan = localStorage.getItem("kuoia:selectedPlan") || "Sin plan";
let profileAvatarData = localStorage.getItem("kuoia:profileAvatar") || "";
let activeConversationId = null;
let activeConversationMembers = [];
let conversationsCache = [];
let activeChatChannel = null;

let productShape = null;
let productsOffset = 0;
const PAGE_SIZE = 12;
let activeProductDetail = null;
let activeEditingProductId = null;

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

const productCatalog = [];

let uploadedProductsCount = 0;

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
};

const normalize = (value) => String(value || "").toLowerCase();

const safeValue = (row, key, fallback = "") => {
  if (!row || !key) return fallback;
  return row[key] ?? fallback;
};

const ensureProductShape = async () => {
  if (!supabase) return null;
  if (productShape) return productShape;
  productShape = await inferProductShape(supabase);
  return productShape;
};

const getFilteredProducts = () => {
  const query = normalize(searchInput.value).trim();
  const maxPrice = Number(priceRange.value);

  return productCatalog.filter((item) => {
    const title = normalize(safeValue(item, productShape?.map?.title));
    const description = normalize(safeValue(item, productShape?.map?.description));
    const matchQuery = !query || `${title} ${description}`.includes(query);
    const rawPrice = Number(safeValue(item, productShape?.map?.price, 0));
    const matchPrice = Number.isFinite(rawPrice) ? rawPrice <= maxPrice : true;
    return matchQuery && matchPrice;
  });
};

const renderProducts = () => {
  const filteredProducts = getFilteredProducts();

  marketplaceGrid.innerHTML = filteredProducts.map((item) => productCardHTML(item, productShape)).join("");

  resultsMeta.textContent = `Mostrando ${filteredProducts.length} resultados.`;
  emptyState.classList.toggle("hidden", filteredProducts.length !== 0);
};

const loadPublicProducts = async ({ reset = true } = {}) => {
  if (!supabase || !productShape) return;

  if (reset) {
    productsOffset = 0;
    productCatalog.length = 0;
    marketplaceGrid.innerHTML = '<p class="empty-state">Cargando productos...</p>';
  }

  const rows = await listProducts(supabase, productShape, { limit: PAGE_SIZE, offset: productsOffset });
  if (reset) productCatalog.length = 0;
  productCatalog.push(...rows);
  productsOffset += rows.length;

  renderProducts();
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
  if (!chatRegistryButton) return;
  const chatCount = conversationsCache.length;
  chatRegistryButton.classList.toggle("has-unread", chatCount > 0);
  chatRegistryButton.textContent = `💬 Chats (${chatCount})`;
};

const hideAllViews = () => {
  authView.classList.add("hidden");
  marketplaceView.classList.add("hidden");
  subscriptionsView.classList.add("hidden");
  uploadProductView?.classList.add("hidden");
  profileView.classList.add("hidden");
  chatRegistryView?.classList.add("hidden");
  chatView?.classList.add("hidden");
  productDetailView?.classList.add("hidden");
  myProductsView?.classList.add("hidden");
  editProductView?.classList.add("hidden");
  topbarAuthCta.classList.add("hidden");
  unsubscribeActiveChat();
};

const chatPathFor = (conversationId) => (conversationId ? `/chats/${conversationId}` : "/chats");

const navigateTo = (path, { replace = false } = {}) => {
  if (window.location.pathname === path) return;
  const fn = replace ? window.history.replaceState : window.history.pushState;
  fn.call(window.history, {}, "", path);
};

const setChatRegistryStatus = (message = "") => {
  if (chatRegistryStatus) chatRegistryStatus.textContent = message;
};

const setChatDetailStatus = (message = "") => {
  if (chatDetailStatus) chatDetailStatus.textContent = message;
};

const renderChatRegistry = () => {
  if (!chatRegistryList || !activeUser) return;

  if (!conversationsCache.length) {
    chatRegistryList.innerHTML = '<p class="empty-state">Aún no tienes conversaciones. Usa "Nuevo chat" para empezar.</p>';
    return;
  }

  chatRegistryList.innerHTML = conversationsCache
    .map((conversation) => {
      const peerId = conversation.participants.find((id) => id !== activeUser.id) || "Usuario";
      const lastMessage = conversation.lastMessage;
      const lastDate = formatChatDate(conversation.last_message_at || lastMessage?.created_at);
      return `
        <article class="chat-registry-item">
          <div>
            <p class="chat-registry-product">${peerId}</p>
            <p class="chat-registry-meta">${lastDate || "Sin fecha"}</p>
            <p class="chat-registry-snippet">${lastMessage?.content || "Sin mensajes todavía."}</p>
          </div>
          <button type="button" class="btn btn-secondary chat-registry-open-btn" data-conversation-id="${conversation.id}">Abrir chat</button>
        </article>
      `;
    })
    .join("");
};

const refreshConversations = async () => {
  if (!supabase || !activeUser) return;
  setChatRegistryStatus("Cargando conversaciones...");
  try {
    conversationsCache = await listConversationsForUser(supabase, activeUser.id);
    setChatRegistryStatus("");
    updateIndicatorsUI();
    renderChatRegistry();
  } catch (error) {
    setChatRegistryStatus(error.message || "Error al cargar conversaciones.");
  }
};

const unsubscribeActiveChat = async () => {
  if (!activeChatChannel || !supabase) return;
  await supabase.removeChannel(activeChatChannel);
  activeChatChannel = null;
};

const renderChatMessages = (messages = []) => {
  if (!chatMessages || !activeUser) return;
  chatMessages.innerHTML = messages
    .map((message) => {
      const own = message.sender_id === activeUser.id;
      const who = own ? "Tú" : "Contacto";
      return `
        <article class="chat-bubble ${own ? "self" : "buyer"}">
          <small>${who} · ${formatChatDate(message.created_at)}</small>
          <p>${message.content || ""}</p>
        </article>
      `;
    })
    .join("");
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const subscribeConversation = (conversationId) => {
  if (!supabase || !conversationId) return;

  activeChatChannel = supabase
    .channel(`chat:${conversationId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
      async (payload) => {
        try {
          const messages = await getConversationMessages(supabase, conversationId);
          renderChatMessages(messages);
          await refreshConversations();
        } catch (_error) {
          setChatDetailStatus("Error recibiendo mensajes en tiempo real.");
        }
        if (payload.new.sender_id !== activeUser?.id) showToast("Nuevo mensaje recibido.");
      },
    )
    .subscribe();
};

const openConversation = async (conversationId, { replace = false } = {}) => {
  if (!supabase || !activeUser) return;

  hideAllViews();
  chatView?.classList.remove("hidden");
  navigateTo(chatPathFor(conversationId), { replace });
  activeConversationId = conversationId;
  setChatDetailStatus("Cargando conversación...");

  try {
    const allowed = await isConversationParticipant(supabase, conversationId, activeUser.id);
    if (!allowed) {
      setChatDetailStatus("No autorizado para ver esta conversación.");
      chatMessages.innerHTML = "";
      return;
    }

    await unsubscribeActiveChat();
    const messages = await getConversationMessages(supabase, conversationId);
    const conversation = conversationsCache.find((entry) => entry.id === conversationId);
    activeConversationMembers = conversation?.participants || [];

    if (chatTitle) chatTitle.textContent = "Conversación 1:1";
    if (chatContactName) chatContactName.textContent = activeConversationMembers.find((id) => id !== activeUser.id) || "Usuario";
    if (chatProductName) chatProductName.textContent = conversationId;
    if (chatProductPrice) chatProductPrice.textContent = "En línea";

    renderChatMessages(messages);
    subscribeConversation(conversationId);
    setChatDetailStatus(messages.length ? "" : "Sin mensajes todavía. Escribe el primero.");
  } catch (error) {
    setChatDetailStatus(error.message || "Error cargando la conversación.");
  }
};

const showChatRegistryView = async ({ replace = false } = {}) => {
  if (!activeUser) return;
  hideAllViews();
  chatRegistryView?.classList.remove("hidden");
  navigateTo("/chats", { replace });
  await refreshConversations();
};

const resolveRoute = async ({ replace = false } = {}) => {
  if (!activeUser) {
    await unsubscribeActiveChat();
    showAuthView();
    return;
  }

  const path = window.location.pathname;

  if (path === "/chats") {
    await showChatRegistryView({ replace });
    return;
  }

  const conversationMatch = path.match(/^\/chats\/([^/]+)$/);
  if (conversationMatch) {
    await refreshConversations();
    await openConversation(conversationMatch[1], { replace });
    return;
  }

  if (path === "/" || path === "/products") {
    await showProductsView({ replace });
    return;
  }

  const productMatch = path.match(/^\/products\/([^/]+)$/);
  if (productMatch) {
    await showProductDetailView(productMatch[1], { replace });
    return;
  }

  if (path === "/sell" || path === "/products/new") {
    showUploadProductView();
    navigateTo("/sell", { replace });
    return;
  }

  if (path === "/my-products") {
    await showMyProductsView({ replace });
    return;
  }

  const editMatch = path.match(/^\/my-products\/([^/]+)\/edit$/);
  if (editMatch) {
    await showEditProductView(editMatch[1], { replace });
    return;
  }

  await showProductsView({ replace });
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
  uploadProductView?.classList.add("hidden");
  profileView.classList.add("hidden");
  chatRegistryView?.classList.add("hidden");
  chatView?.classList.add("hidden");
  productDetailView?.classList.add("hidden");
  myProductsView?.classList.add("hidden");
  editProductView?.classList.add("hidden");
  topbarAuthCta.classList.add("hidden");
};

const showSubscriptionsView = () => {
  authView.classList.add("hidden");
  marketplaceView.classList.add("hidden");
  subscriptionsView.classList.remove("hidden");
  uploadProductView?.classList.add("hidden");
  profileView.classList.add("hidden");
  chatRegistryView?.classList.add("hidden");
  chatView?.classList.add("hidden");
  productDetailView?.classList.add("hidden");
  myProductsView?.classList.add("hidden");
  editProductView?.classList.add("hidden");

  if (activeUser) {
    topbarAuthCta.textContent = "Volver a ventas";
    topbarAuthCta.classList.remove("hidden");
    return;
  }

  topbarAuthCta.classList.add("hidden");
};

const showMarketplaceView = (user, { replace = false } = {}) => {
  activeUser = user;
  hideAllViews();
  marketplaceView.classList.remove("hidden");
  navigateTo("/products", { replace });
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
  uploadProductView?.classList.add("hidden");
  profileView.classList.remove("hidden");
  chatRegistryView?.classList.add("hidden");
  chatView?.classList.add("hidden");
  productDetailView?.classList.add("hidden");
  myProductsView?.classList.add("hidden");
  editProductView?.classList.add("hidden");
  topbarAuthCta.classList.add("hidden");
  fillProfileForm(activeUser);
};

const showUploadProductView = () => {
  authView.classList.add("hidden");
  marketplaceView.classList.add("hidden");
  subscriptionsView.classList.add("hidden");
  uploadProductView?.classList.remove("hidden");
  profileView.classList.add("hidden");
  chatRegistryView?.classList.add("hidden");
  chatView?.classList.add("hidden");
  productDetailView?.classList.add("hidden");
  myProductsView?.classList.add("hidden");
  editProductView?.classList.add("hidden");
  topbarAuthCta.classList.add("hidden");
};

const showProductsView = async ({ replace = false } = {}) => {
  if (!activeUser) return;
  hideAllViews();
  marketplaceView.classList.remove("hidden");
  navigateTo("/products", { replace });
  updateAvatarUI();
  updateIndicatorsUI();
  await ensureProductShape();
  updatePriceLabel();
  await loadPublicProducts({ reset: true });
};

const renderProductDetail = (product) => {
  if (!productShape || !productDetailBody) return;
  const title = safeValue(product, productShape.map.title, "Sin título");
  const description = safeValue(product, productShape.map.description, "Sin descripción");
  const price = Number(safeValue(product, productShape.map.price, 0));
  const image = safeValue(product, productShape.map.image_url, "https://placehold.co/800x500?text=Producto");
  const ownerId = safeValue(product, productShape.map.user_id, "-");

  productDetailTitle.textContent = title;
  productDetailBody.innerHTML = `
    <img src="${image}" alt="${title}" class="product-image" />
    <p><strong>Precio:</strong> ${price.toFixed(2)} €</p>
    <p>${description}</p>
    <p><small>Vendedor: ${ownerId}</small></p>
  `;
};

const showProductDetailView = async (id, { replace = false } = {}) => {
  hideAllViews();
  productDetailView?.classList.remove("hidden");
  navigateTo(`/products/${id}`, { replace });

  try {
    await ensureProductShape();
    const product = await getProduct(supabase, productShape, id);
    if (!product) {
      productDetailBody.innerHTML = '<p class="empty-state">Producto no encontrado.</p>';
      return;
    }
    activeProductDetail = product;
    renderProductDetail(product);
  } catch (error) {
    productDetailBody.innerHTML = `<p class="empty-state">${error.message}</p>`;
  }
};

const renderMyProducts = async () => {
  if (!activeUser || !productShape) return;
  myProductsStatus.textContent = "Cargando mis productos...";
  try {
    const rows = await listMyProducts(supabase, productShape, activeUser.id);
    if (!rows.length) {
      myProductsGrid.innerHTML = '<p class="empty-state">Aún no has publicado productos.</p>';
      myProductsStatus.textContent = "";
      return;
    }

    myProductsGrid.innerHTML = rows
      .map((item) => {
        const id = safeValue(item, productShape.map.id, "");
        return `${productCardHTML(item, productShape)}
          <div class="card-actions" data-my-actions="${id}">
            <button class="action-btn" data-my-action="edit" data-id="${id}">Editar</button>
            <button class="action-btn buy" data-my-action="delete" data-id="${id}">Borrar</button>
          </div>`;
      })
      .join("");

    myProductsStatus.textContent = "";
  } catch (error) {
    myProductsStatus.textContent = error.message;
  }
};

const showMyProductsView = async ({ replace = false } = {}) => {
  hideAllViews();
  myProductsView?.classList.remove("hidden");
  navigateTo("/my-products", { replace });
  await ensureProductShape();
  await renderMyProducts();
};

const showEditProductView = async (id, { replace = false } = {}) => {
  hideAllViews();
  editProductView?.classList.remove("hidden");
  navigateTo(`/my-products/${id}/edit`, { replace });
  activeEditingProductId = id;

  try {
    await ensureProductShape();
    const product = await getProduct(supabase, productShape, id);
    if (!product) {
      showToast("Producto no encontrado.");
      return;
    }
    fillProductForm(editProductForm, product, productShape);
  } catch (error) {
    showToast(error.message);
  }
};

const persistSelectedPlan = (planName) => {
  selectedPlan = planName;
  localStorage.setItem("kuoia:selectedPlan", planName);
  if (currentPlanInput) currentPlanInput.value = planName;
};

loginTab.addEventListener("click", () => setActivePanel("login"));
registerTab.addEventListener("click", () => setActivePanel("register"));
marketplaceSubscriptionsButton?.addEventListener("click", showSubscriptionsView);
uploadProductButton?.addEventListener("click", () => { showUploadProductView(); navigateTo("/sell"); });
uploadProductBackButton?.addEventListener("click", async () => showProductsView());
profileSubscriptionsButton?.addEventListener("click", showSubscriptionsView);
subscriptionsBackButton?.addEventListener("click", () => {
  if (activeUser) {
    showProductsView();
    return;
  }
  showAuthView();
});
profileButton?.addEventListener("click", showProfileView);
profileBackButton?.addEventListener("click", async () => showProductsView());
chatBackButton?.addEventListener("click", async () => showChatRegistryView());
chatRegistryButton?.addEventListener("click", async () => showChatRegistryView());
chatRegistryBackButton?.addEventListener("click", async () => showProductsView());
browseProductsButton?.addEventListener("click", async () => showProductsView());
myProductsButton?.addEventListener("click", async () => showMyProductsView());
myProductsBackButton?.addEventListener("click", async () => showProductsView());
productDetailBackButton?.addEventListener("click", async () => showProductsView());
editProductBackButton?.addEventListener("click", async () => showMyProductsView());
contactOwnerButton?.addEventListener("click", async () => {
  // TODO: conectar con conversación por owner y product_id cuando exista mapping directo.
  await showChatRegistryView();
});
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
  if (activeUser) {
    showProductsView();
    return;
  }

  showAuthView();
  setActivePanel("login");
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
  showProductsView();
});

[searchInput, locationFilter, centerFilter, typeFilter].forEach((input) => {
  input.addEventListener("input", renderProducts);
  input.addEventListener("change", renderProducts);
});

priceRange.addEventListener("input", () => {
  updatePriceLabel();
  renderProducts();
});

marketplaceGrid.addEventListener("click", async (event) => {
  const link = event.target instanceof Element ? event.target.closest('a[href^="/products/"]') : null;
  if (link instanceof HTMLAnchorElement) {
    event.preventDefault();
    const id = link.getAttribute("href")?.split("/").pop();
    if (id) await showProductDetailView(id);
  }
});

chatRegistryList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  const conversationId = target.dataset.conversationId;
  if (!conversationId) return;
  await openConversation(conversationId);
});

newChatForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeUser || !supabase || !newChatEmail) return;

  const email = newChatEmail.value.trim();
  setChatRegistryStatus("Creando conversación...");

  try {
    const user = await findUserIdByEmail(supabase, email);
    const conversation = await getOrCreateConversation(supabase, activeUser.id, user.id);
    newChatForm.reset();
    await refreshConversations();
    await openConversation(conversation.id);
    setChatRegistryStatus("");
  } catch (error) {
    setChatRegistryStatus(error.message || "No fue posible crear el chat.");
  }
});

chatForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeConversationId || !chatInput || !activeUser || !supabase) return;
  const message = chatInput.value.trim();
  if (!message) return;

  try {
    await sendConversationMessage(supabase, activeConversationId, activeUser.id, message);
    chatForm.reset();
    const messages = await getConversationMessages(supabase, activeConversationId);
    renderChatMessages(messages);
    await refreshConversations();
    setChatDetailStatus("");
  } catch (error) {
    setChatDetailStatus(error.message || "No fue posible enviar el mensaje.");
  }
});



window.addEventListener("popstate", async () => {
  await resolveRoute({ replace: true });
});

uploadProductForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeUser || !supabase) return;

  try {
    await ensureProductShape();
    const formData = new FormData(uploadProductForm);
    const title = String(formData.get("title") || "");
    const description = String(formData.get("description") || "");
    const price = formData.get("price");

    const { errors, cleanTitle, numericPrice } = validateProductInput({ title, price });
    if (errors.length) {
      showToast(errors[0]);
      return;
    }

    const payload = buildCreatePayload({
      shape: productShape,
      userId: activeUser.id,
      title: cleanTitle,
      description,
      price: numericPrice,
    });

    await createProduct(supabase, productShape, payload);
    uploadProductForm.reset();
    showToast("Producto creado correctamente.");
    await showMyProductsView();
  } catch (error) {
    showToast(error.message || "No se pudo crear el producto.");
  }
});

myProductsGrid?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;
  const action = target.dataset.myAction;
  const id = target.dataset.id;
  if (!action || !id) return;

  if (action === "edit") {
    await showEditProductView(id);
    return;
  }

  if (action === "delete") {
    try {
      await deleteProduct(supabase, productShape, id);
      showToast("Producto eliminado.");
      await renderMyProducts();
    } catch (error) {
      showToast(error.message || "No se pudo eliminar.");
    }
  }
});

editProductForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeEditingProductId || !productShape) return;

  const formData = new FormData(editProductForm);
  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");
  const price = formData.get("price");
  const { errors, cleanTitle, numericPrice } = validateProductInput({ title, price });
  if (errors.length) {
    showToast(errors[0]);
    return;
  }

  const payload = {};
  if (productShape.map.title) payload[productShape.map.title] = cleanTitle;
  if (productShape.map.description) payload[productShape.map.description] = description.trim();
  if (productShape.map.price) payload[productShape.map.price] = numericPrice;

  try {
    await updateProduct(supabase, productShape, activeEditingProductId, payload);
    showToast("Producto actualizado.");
    await showMyProductsView();
  } catch (error) {
    showToast(error.message || "No se pudo actualizar.");
  }
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

  activeUser = data.user;
  await resolveRoute({ replace: true });
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
      activeUser = data.user;
  await resolveRoute({ replace: true });
      showToast("Cuenta creada. Activa tu email después, pero ya puedes explorar el inicio.");
      registerPanel.reset();
      return;
    }

    activeUser = signInData.user;
    await resolveRoute({ replace: true });
    showToast("Usuario creado correctamente ✨");
    registerPanel.reset();
  }
});

logoutButton.addEventListener("click", async () => {
  if (supabase) await supabase.auth.signOut();
  await unsubscribeActiveChat();
  showAuthView();
  showToast("Sesión cerrada.");
  setActivePanel("login");
});

updateAvatarUI();
updateIndicatorsUI();

const connectionStatus = await checkSupabaseConnection();
if (!connectionStatus.ok) showToast(connectionStatus.message);

if (supabase) {
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      activeUser = session.user;
      await resolveRoute({ replace: true });
      return;
    }
    activeUser = null;
    await unsubscribeActiveChat();
    showAuthView();
  });

  const { data } = await supabase.auth.getSession();
  if (data.session?.user) {
    activeUser = data.session.user;
    await resolveRoute({ replace: true });
  } else showAuthView();
} else {
  await unsubscribeActiveChat();
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
