const TOKEN_KEY = "sahel_auth_token";
const USER_KEY = "sahel_user";
const SHOP_KEY = "sahel_shop";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
  const value = localStorage.getItem(USER_KEY);
  return value ? JSON.parse(value) : null;
}

export function getCurrentShop() {
  const value = localStorage.getItem(SHOP_KEY);
  return value ? JSON.parse(value) : null;
}

export function updateLocalUser(updates) {
  const currentUser = getCurrentUser() || {};
  const nextUser = { ...currentUser, ...updates };
  localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  return nextUser;
}

export function updateLocalShop(updates) {
  const currentShop = getCurrentShop() || {};
  const nextShop = { ...currentShop, ...updates };
  localStorage.setItem(SHOP_KEY, JSON.stringify(nextShop));
  return nextShop;
}

export function saveSession({ token, user, shop }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(SHOP_KEY, JSON.stringify(shop));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SHOP_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}
