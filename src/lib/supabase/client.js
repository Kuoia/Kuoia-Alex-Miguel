import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

let cachedClient = null;

const readMeta = (name) => document.querySelector(`meta[name="${name}"]`)?.content?.trim() || "";

export const getSupabaseConfig = () => {
  const url =
    window.__ENV__?.NEXT_PUBLIC_SUPABASE_URL ||
    window.NEXT_PUBLIC_SUPABASE_URL ||
    readMeta("supabase-url") ||
    "";

  const anonKey =
    window.__ENV__?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    window.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    readMeta("supabase-anon-key") ||
    "";

  return { url, anonKey };
};

export const getSupabaseClient = () => {
  if (cachedClient) return cachedClient;

  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;

  cachedClient = createClient(url, anonKey);
  return cachedClient;
};
