const SiteStore = (() => {
  const table = "site_data";
  const rowId = 1;

  function cloneDefault() {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  function mergeData(base, incoming) {
    const merged = { ...cloneDefault(), ...(incoming || {}) };
    merged.home = { ...cloneDefault().home, ...(incoming?.home || {}) };
    merged.ending = { ...cloneDefault().ending, ...(incoming?.ending || {}) };
    merged.effects = { ...cloneDefault().effects, ...(incoming?.effects || {}) };
    merged.letters = Array.isArray(incoming?.letters) ? incoming.letters : cloneDefault().letters;
    merged.gallery = Array.isArray(incoming?.gallery) ? incoming.gallery : [];
    return merged;
  }

  function configured() {
    return typeof window.supabase !== "undefined" &&
      typeof SUPABASE_URL !== "undefined" &&
      typeof SUPABASE_ANON_KEY !== "undefined" &&
      SUPABASE_URL.startsWith("https://") &&
      !SUPABASE_URL.includes("PASTE_") &&
      !SUPABASE_ANON_KEY.includes("PASTE_");
  }

  const client = configured() ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  async function loadData() {
    if (!client) return getSiteData();
    const { data, error } = await client.from(table).select("data").eq("id", rowId).maybeSingle();
    if (error) {
      console.warn("Supabase load error, fallback localStorage:", error.message);
      return getSiteData();
    }
    if (!data) {
      const defaults = cloneDefault();
      await saveData(defaults);
      return defaults;
    }
    const merged = mergeData(cloneDefault(), data.data);
    localStorage.setItem("sakuraBirthdayData", JSON.stringify(merged));
    return merged;
  }

  async function saveData(payload) {
    const clean = mergeData(cloneDefault(), payload);
    localStorage.setItem("sakuraBirthdayData", JSON.stringify(clean));
    if (!client) return { online: false };
    const { error } = await client.from(table).upsert({ id: rowId, data: clean, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { online: true };
  }

  function safeName(file) {
    const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
    return `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function uploadFile(bucket, file) {
    if (!file) return "";
    if (!client) return await fileToDataUrl(file);
    const path = safeName(file);
    const { error } = await client.storage.from(bucket).upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data } = client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  return { loadData, saveData, uploadFile, isOnline: !!client };
})();
