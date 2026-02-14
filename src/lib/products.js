const PRODUCT_TABLE = "products";

const knownColumns = {
  id: ["id", "product_id"],
  user_id: ["user_id", "owner_id", "seller_id", "author_id"],
  title: ["title", "name"],
  description: ["description", "details", "content"],
  price: ["price", "amount", "cost"],
  created_at: ["created_at", "inserted_at", "createdAt"],
  updated_at: ["updated_at", "updatedAt"],
  image_url: ["image_url", "image", "photo_url", "thumbnail_url"],
  is_active: ["is_active", "active", "published"],
};

const pickColumn = (shape, aliases = []) => aliases.find((name) => shape?.columns?.includes(name)) || null;

const parseRlsError = (error) => {
  if (!error) return "Operación no permitida.";
  const text = `${error.message || ""} ${error.details || ""}`.toLowerCase();
  if (text.includes("row-level security") || text.includes("permission denied")) {
    return "No tienes permiso para esta acción (RLS).";
  }
  return error.message || "No fue posible completar la operación.";
};

export const inferProductShape = async (supabase) => {
  const { data, error } = await supabase.from(PRODUCT_TABLE).select("*").limit(1);
  if (error) throw new Error(parseRlsError(error));

  const sample = data?.[0] || {};
  const columns = Object.keys(sample);

  const shape = {
    columns,
    sample,
    map: {
      id: pickColumn({ columns }, knownColumns.id),
      user_id: pickColumn({ columns }, knownColumns.user_id),
      title: pickColumn({ columns }, knownColumns.title),
      description: pickColumn({ columns }, knownColumns.description),
      price: pickColumn({ columns }, knownColumns.price),
      created_at: pickColumn({ columns }, knownColumns.created_at),
      updated_at: pickColumn({ columns }, knownColumns.updated_at),
      image_url: pickColumn({ columns }, knownColumns.image_url),
      is_active: pickColumn({ columns }, knownColumns.is_active),
    },
  };

  return shape;
};

const sortByCreatedAtDesc = (query, shape) => {
  if (shape?.map?.created_at) {
    return query.order(shape.map.created_at, { ascending: false });
  }
  if (shape?.map?.id) {
    return query.order(shape.map.id, { ascending: false });
  }
  return query;
};

export const listProducts = async (supabase, shape, { limit = 12, offset = 0 } = {}) => {
  let query = supabase.from(PRODUCT_TABLE).select("*").range(offset, offset + limit - 1);

  if (shape?.map?.is_active) {
    query = query.eq(shape.map.is_active, true);
  }

  query = sortByCreatedAtDesc(query, shape);

  const { data, error } = await query;
  if (error) throw new Error(parseRlsError(error));

  return data || [];
};

export const getProduct = async (supabase, shape, id) => {
  const idColumn = shape?.map?.id || "id";
  const { data, error } = await supabase.from(PRODUCT_TABLE).select("*").eq(idColumn, id).maybeSingle();
  if (error) throw new Error(parseRlsError(error));
  return data;
};

export const createProduct = async (supabase, shape, payload) => {
  const { data, error } = await supabase.from(PRODUCT_TABLE).insert(payload).select("*").single();
  if (error) throw new Error(parseRlsError(error));
  return data;
};

export const listMyProducts = async (supabase, shape, userId) => {
  if (!shape?.map?.user_id) throw new Error("No existe columna de ownership (user_id equivalente).");
  let query = supabase.from(PRODUCT_TABLE).select("*").eq(shape.map.user_id, userId);
  query = sortByCreatedAtDesc(query, shape);
  const { data, error } = await query;
  if (error) throw new Error(parseRlsError(error));
  return data || [];
};

export const updateProduct = async (supabase, shape, id, payload) => {
  const idColumn = shape?.map?.id || "id";
  const { data, error } = await supabase.from(PRODUCT_TABLE).update(payload).eq(idColumn, id).select("*").single();
  if (error) throw new Error(parseRlsError(error));
  return data;
};

export const deleteProduct = async (supabase, shape, id) => {
  const idColumn = shape?.map?.id || "id";
  const { error } = await supabase.from(PRODUCT_TABLE).delete().eq(idColumn, id);
  if (error) throw new Error(parseRlsError(error));
};

export const buildCreatePayload = ({ shape, userId, title, description, price, imageUrl }) => {
  const payload = {};
  const map = shape.map;

  if (map.title) payload[map.title] = title.trim();
  if (map.description && description) payload[map.description] = description.trim();
  if (map.price) payload[map.price] = Number(price);
  if (map.user_id) payload[map.user_id] = userId;
  if (map.image_url && imageUrl) payload[map.image_url] = imageUrl;
  if (map.is_active) payload[map.is_active] = true;

  return payload;
};

export const validateProductInput = ({ title, price }) => {
  const errors = [];
  const cleanTitle = String(title || "").trim();
  const numericPrice = Number(price);

  if (!cleanTitle) errors.push("El título es obligatorio.");
  if (cleanTitle.length > 120) errors.push("El título no puede superar 120 caracteres.");
  if (!Number.isFinite(numericPrice) || numericPrice < 0) errors.push("El precio debe ser numérico y >= 0.");

  return { errors, cleanTitle, numericPrice };
};
