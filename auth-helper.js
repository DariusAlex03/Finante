// ============================================================
//  BaniBine — helper autentificare (Supabase + mod demo)
// ============================================================
(function () {
  let client = null;

  function configured() {
    return !!(window.SUPABASE_URL && window.SUPABASE_ANON_KEY);
  }

  function getClient() {
    if (!configured() || !window.supabase) return null;
    if (!client) client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    return client;
  }

  // întoarce { email, mode } sau null dacă nu e logat
  async function getUser() {
    if (configured()) {
      try {
        const { data } = await getClient().auth.getSession();
        if (data && data.session) return { email: data.session.user.email, mode: "supabase" };
        return null;
      } catch (e) { return null; }
    }
    const demo = localStorage.getItem("banibine_demo_user");
    return demo ? { email: demo, mode: "demo" } : null;
  }

  async function signIn(email, password) {
    const c = getClient();
    const { error } = await c.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp(email, password) {
    const c = getClient();
    const { data, error } = await c.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    if (configured() && getClient()) {
      try { await getClient().auth.signOut(); } catch (e) {}
    }
    localStorage.removeItem("banibine_demo_user");
  }

  function demoLogin(email) {
    localStorage.setItem("banibine_demo_user", email || "demo@banibine.ro");
  }

  window.BBAuth = { configured, getClient, getUser, signIn, signUp, signOut, demoLogin };
})();
