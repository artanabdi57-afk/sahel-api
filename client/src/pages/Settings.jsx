// ─────────────────────────────────────────────────────────────────────────────
// REPLACE the handleSwitchShop function in Settings.jsx with this version.
// Also add `apiRequest` to your imports from "../lib/api" if not already there.
// ─────────────────────────────────────────────────────────────────────────────

async function handleSwitchShop(selectedShop) {
  if (selectedShop.id === shop?.id) return;
  setSwitchingShop(selectedShop.id);
  try {
    // 1. Ask the backend for a NEW token with the selected shop_id baked in.
    //    Without this, all API calls still use the old shop from the JWT.
    const response = await apiRequest("/auth/switch-shop", {
      method: "POST",
      body: JSON.stringify({ shop_id: selectedShop.id }),
    });

    const { token, user, shop: newShop } = response.data;

    // 2. Overwrite the stored session with the new token + new shop
    localStorage.setItem("sahel_auth_token", token);
    localStorage.setItem("sahel_user",       JSON.stringify(user));
    localStorage.setItem("sahel_shop",       JSON.stringify(newShop));

    showMsg(`Switching to ${selectedShop.shop_name}…`, "success");

    // 3. Hard reload so every component re-reads the new token from scratch
    setTimeout(() => window.location.href = "/dashboard", 800);
  } catch (err) {
    showMsg(err.message, "error");
  } finally {
    setSwitchingShop(null);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Also add apiRequest to your Settings.jsx import:
//
//   import { getSavedCurrency, saveCurrency, apiRequest } from "../lib/api";
//
// ─────────────────────────────────────────────────────────────────────────────
