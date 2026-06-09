(function () {
  const AUTH_KEY = "made3d.admin.authenticated";
  const DEFAULT_USERNAME = "admin";
  const DEFAULT_PASSWORD = "123456";

  const isLoginPage = () => document.body?.dataset.adminPage === "login";

  const getCredentials = () => {
    const settings = Store.getSettings();
    return {
      username: settings.adminUsername || DEFAULT_USERNAME,
      password: settings.adminPassword || DEFAULT_PASSWORD
    };
  };

  const isAuthenticated = () => sessionStorage.getItem(AUTH_KEY) === "true";

  const login = (username, password) => {
    const credentials = getCredentials();
    const valid = username === credentials.username && password === credentials.password;
    if (valid) sessionStorage.setItem(AUTH_KEY, "true");
    return valid;
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    window.location.href = "login.html";
  };

  const requireAuth = () => {
    if (isLoginPage() || isAuthenticated()) return;
    const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
    window.location.replace(`login.html?next=${next}`);
  };

  const bindLoginForm = () => {
    const form = document.querySelector("#loginForm");
    if (!form) return;

    if (isAuthenticated()) {
      window.location.href = Utils.getParam("next") || "index.html";
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const valid = login(data.get("username"), data.get("password"));
      if (!valid) {
        document.querySelector("#loginError").textContent = "Kullanıcı adı veya şifre hatalı.";
        return;
      }
      window.location.href = Utils.getParam("next") || "index.html";
    });
  };

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-admin-logout]")) return;
    logout();
  });

  requireAuth();
  document.addEventListener("DOMContentLoaded", bindLoginForm);

  window.AdminAuth = {
    isAuthenticated,
    login,
    logout,
    requireAuth
  };
})();
