const TOKEN_KEY = "sahel_auth_token";
const USER_KEY = "sahel_user";
const SHOP_KEY = "sahel_shop";

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function getCurrentUser() { const value = localStorage.getItem(USER_KEY); return value ? JSON.parse(value) : null; }
export function getCurrentShop() { const value = localStorage.getItem(SHOP_KEY); return value ? JSON.parse(value) : null; }

export function getHomePath(user = getCurrentUser(), shop = getCurrentShop()) {
  if (shop?.business_type === "hospital") {
    const role = String(user?.hospital_role || user?.role || user?.staff_role || "").toLowerCase().replace(/[-\s]+/g, "_");
    const rolePaths = {
      doctor: "/hospital/doctor",
      nurse: "/hospital/nurse",
      laboratory_technician: "/hospital/laboratory",
      lab_technician: "/hospital/laboratory",
      pharmacist: "/hospital/pharmacy",
      accountant: "/hospital/billing",
      receptionist: "/hospital/reception",
      hr_staff_manager: "/hospital/staff",
      staff_manager: "/hospital/staff",
      hospital_manager: "/hospital/dashboard",
      manager: "/hospital/dashboard",
      admin: "/hospital/dashboard",
      owner: "/hospital/dashboard",
    };
    return rolePaths[role] || "/hospital/dashboard";
  }
  return "/dashboard";
}

function notifySessionChanged() { window.dispatchEvent(new Event("sahel-session-changed")); }

export function updateLocalUser(updates) {
  const currentUser = getCurrentUser() || {};
  const nextUser = { ...currentUser, ...updates };
  localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  notifySessionChanged();
  return nextUser;
}

export function updateLocalShop(updates) {
  const currentShop = getCurrentShop() || {};
  const nextShop = { ...currentShop, ...updates };
  localStorage.setItem(SHOP_KEY, JSON.stringify(nextShop));
  notifySessionChanged();
  return nextShop;
}

export function saveSession({ token, user, shop }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(SHOP_KEY, JSON.stringify(shop));
  notifySessionChanged();
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SHOP_KEY);
  notifySessionChanged();
}

export function isAuthenticated() { return Boolean(getToken()); }
