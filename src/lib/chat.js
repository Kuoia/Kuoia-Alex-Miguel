export const formatChatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const unique = (values) => [...new Set(values.filter(Boolean))];

export const listConversationsForUser = async (supabase, userId) => {
  const { data: participantRows, error: participantError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);

  if (participantError) throw participantError;

  const conversationIds = unique((participantRows || []).map((row) => row.conversation_id));
  if (!conversationIds.length) return [];

  const [conversationsResult, membersResult, messagesResult] = await Promise.all([
    supabase
      .from("conversations")
      .select("id,last_message_at,created_at")
      .in("id", conversationIds)
      .order("last_message_at", { ascending: false, nullsFirst: false }),
    supabase.from("conversation_participants").select("conversation_id,user_id").in("conversation_id", conversationIds),
    supabase
      .from("messages")
      .select("id,conversation_id,sender_id,content,created_at")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false }),
  ]);

  if (conversationsResult.error) throw conversationsResult.error;
  if (membersResult.error) throw membersResult.error;
  if (messagesResult.error) throw messagesResult.error;

  const messagesByConversation = new Map();
  for (const message of messagesResult.data || []) {
    if (!messagesByConversation.has(message.conversation_id)) {
      messagesByConversation.set(message.conversation_id, message);
    }
  }

  const membersByConversation = new Map();
  for (const member of membersResult.data || []) {
    const acc = membersByConversation.get(member.conversation_id) || [];
    acc.push(member.user_id);
    membersByConversation.set(member.conversation_id, acc);
  }

  return (conversationsResult.data || []).map((conversation) => ({
    ...conversation,
    participants: unique(membersByConversation.get(conversation.id) || []),
    lastMessage: messagesByConversation.get(conversation.id) || null,
  }));
};

export const isConversationParticipant = async (supabase, conversationId, userId) => {
  const { data, error } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
};

export const getConversationMessages = async (supabase, conversationId) => {
  const { data, error } = await supabase
    .from("messages")
    .select("id,conversation_id,sender_id,content,created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getOrCreateConversation = async (supabase, userIdA, userIdB) => {
  const left = String(userIdA || "");
  const right = String(userIdB || "");

  if (!left || !right) throw new Error("Los dos user_id son obligatorios.");
  if (left === right) throw new Error("No puedes iniciar un chat contigo mismo.");

  const [aResult, bResult] = await Promise.all([
    supabase.from("conversation_participants").select("conversation_id").eq("user_id", left),
    supabase.from("conversation_participants").select("conversation_id").eq("user_id", right),
  ]);

  if (aResult.error) throw aResult.error;
  if (bResult.error) throw bResult.error;

  const aSet = new Set((aResult.data || []).map((row) => row.conversation_id));
  const sharedConversationId = (bResult.data || []).map((row) => row.conversation_id).find((id) => aSet.has(id));

  if (sharedConversationId) {
    const { data: existing, error: existingError } = await supabase
      .from("conversations")
      .select("id,last_message_at,created_at")
      .eq("id", sharedConversationId)
      .single();

    if (existingError) throw existingError;
    return existing;
  }

  const { data: newConversation, error: conversationError } = await supabase
    .from("conversations")
    .insert({ last_message_at: new Date().toISOString() })
    .select("id,last_message_at,created_at")
    .single();

  if (conversationError) throw conversationError;

  const { error: participantsError } = await supabase.from("conversation_participants").insert([
    { conversation_id: newConversation.id, user_id: left },
    { conversation_id: newConversation.id, user_id: right },
  ]);

  if (participantsError) throw participantsError;

  return newConversation;
};

export const sendConversationMessage = async (supabase, conversationId, senderId, content) => {
  const cleanContent = String(content || "").trim();
  if (!cleanContent) throw new Error("El mensaje no puede estar vacío.");

  const belongs = await isConversationParticipant(supabase, conversationId, senderId);
  if (!belongs) throw new Error("No autorizado para enviar mensajes en esta conversación.");

  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, content: cleanContent })
    .select("id,conversation_id,sender_id,content,created_at")
    .single();

  if (error) throw error;

  await supabase.from("conversations").update({ last_message_at: data.created_at }).eq("id", conversationId);

  return data;
};

export const findUserIdByEmail = async (supabase, email) => {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) throw new Error("Debes indicar un email.");

  const profilesResult = await supabase.from("profiles").select("id,email").ilike("email", cleanEmail).limit(1);
  if (!profilesResult.error && (profilesResult.data || []).length) {
    return profilesResult.data[0];
  }

  const rpcResult = await supabase.rpc("find_user_by_email", { user_email: cleanEmail });
  if (!rpcResult.error && rpcResult.data) {
    if (Array.isArray(rpcResult.data) && rpcResult.data.length) return rpcResult.data[0];
    if (!Array.isArray(rpcResult.data) && rpcResult.data.id) return rpcResult.data;
  }

  throw new Error(
    "No se pudo resolver ese email. Usa una tabla profiles accesible por RLS o un RPC (find_user_by_email) en servidor.",
  );
};
