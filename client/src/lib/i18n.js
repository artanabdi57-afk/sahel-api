import React from "react";

export const SETTINGS_KEY = "sahel_settings";
export const LANGUAGE_EVENT = "sahel-language-change";

const english = {
  dashboard: "Dashboard",
  inventory: "Inventory",
  newSale: "New Sale",
  credits: "Credits",
  orders: "Orders",
  expenses: "Expenses",
  reports: "Reports",
  settings: "Settings",
  profile: "Profile",
  logout: "Log out",
  searchPlaceholder: "Search sales, products, customers",
  hello: "Hello!",
  dashboardSubtext: "This is what's happening in your store this month",
  todaySales: "Today Sales",
  totalRevenue: "Total Revenue",
  netProfit: "Net Profit",
  quickNewSale: "New Sale",
  addProduct: "Add Product",
  viewReports: "View Reports",
  recentSales: "Recent Sales",
  latestTransactions: "Latest cash and credit transactions",
  time: "Time",
  product: "Product",
  qty: "Qty",
  amount: "Amount",
  payment: "Payment",
  customer: "Customer",
  noSales: "No sales recorded yet.",
  revenue: "Revenue",
  last7Days: "Last 7 days",
  salesByCategory: "Sales by Category",
  topProductsThisMonth: "Top products this month",
  notifications: "Notifications",
  stockHealthy: "Stock looks healthy right now.",
  loginDetails: "Login Details",
  appearance: "Appearance",
  language: "Language",
  shopDetails: "Shop Details",
  light: "Light",
  dark: "Dark",
  saveSettings: "Save settings",
  settingsIntro: "Account, appearance, language, and shop details.",
  loggedEmail: "Logged in Gmail / Email",
  shopId: "Shop ID",
  notAvailable: "Not available"
};

const somali = {
  dashboard: "Dashboard",
  inventory: "Alaabta",
  newSale: "Iib Cusub",
  credits: "Dayn",
  orders: "Dalabaad",
  expenses: "Kharash",
  reports: "Warbixinno",
  settings: "Dejinta",
  profile: "Profile",
  logout: "Ka bax",
  searchPlaceholder: "Raadi iib, alaab, ama macmiil",
  hello: "Salaan!",
  dashboardSubtext: "Tani waa waxa ka socda dukaankaaga bishan",
  todaySales: "Iibka Maanta",
  totalRevenue: "Dakhliga Guud",
  netProfit: "Faa'iido Saafi ah",
  quickNewSale: "Iib Cusub",
  addProduct: "Ku dar Alaab",
  viewReports: "Eeg Warbixinno",
  recentSales: "Iibkii Ugu Dambeeyay",
  latestTransactions: "Lacag iyo dayn ugu dambeysay",
  time: "Waqti",
  product: "Alaab",
  qty: "Tiro",
  amount: "Qiime",
  payment: "Bixin",
  customer: "Macmiil",
  noSales: "Weli iib lama diiwaangelin.",
  revenue: "Dakhli",
  last7Days: "7 maalmood ee u dambeeyay",
  salesByCategory: "Iibka Alaabta",
  topProductsThisMonth: "Alaabta ugu iibka badan bishan",
  notifications: "Ogeysiisyo",
  stockHealthy: "Kaydku hadda wuu fiican yahay.",
  loginDetails: "Faahfaahinta Gelitaanka",
  appearance: "Muuqaalka",
  language: "Luqad",
  shopDetails: "Faahfaahinta Dukaanka",
  light: "Iftiin",
  dark: "Madow",
  saveSettings: "Kaydi dejinta",
  settingsIntro: "Akoon, muuqaal, luqad, iyo faahfaahinta dukaanka.",
  loggedEmail: "Email-ka lagu galay",
  shopId: "Aqoonsiga Dukaanka",
  notAvailable: "Lama hayo"
};

const arabic = {
  dashboard: "\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645",
  inventory: "\u0627\u0644\u0645\u062e\u0632\u0648\u0646",
  newSale: "\u0628\u064a\u0639 \u062c\u062f\u064a\u062f",
  credits: "\u0627\u0644\u062f\u064a\u0648\u0646",
  orders: "\u0627\u0644\u0637\u0644\u0628\u0627\u062a",
  expenses: "\u0627\u0644\u0645\u0635\u0627\u0631\u064a\u0641",
  reports: "\u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631",
  settings: "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a",
  profile: "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062e\u0635\u064a",
  logout: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c",
  searchPlaceholder: "\u0627\u0628\u062d\u062b \u0639\u0646 \u0645\u0628\u064a\u0639\u0627\u062a \u0623\u0648 \u0645\u0646\u062a\u062c\u0627\u062a \u0623\u0648 \u0639\u0645\u0644\u0627\u0621",
  hello: "\u0645\u0631\u062d\u0628\u0627!",
  dashboardSubtext: "\u0647\u0630\u0627 \u0645\u0627 \u064a\u062d\u062f\u062b \u0641\u064a \u0645\u062a\u062c\u0631\u0643 \u0647\u0630\u0627 \u0627\u0644\u0634\u0647\u0631",
  todaySales: "\u0645\u0628\u064a\u0639\u0627\u062a \u0627\u0644\u064a\u0648\u0645",
  totalRevenue: "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0625\u064a\u0631\u0627\u062f\u0627\u062a",
  netProfit: "\u0635\u0627\u0641\u064a \u0627\u0644\u0631\u0628\u062d",
  quickNewSale: "\u0628\u064a\u0639 \u062c\u062f\u064a\u062f",
  addProduct: "\u0625\u0636\u0627\u0641\u0629 \u0645\u0646\u062a\u062c",
  viewReports: "\u0639\u0631\u0636 \u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631",
  recentSales: "\u0622\u062e\u0631 \u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a",
  latestTransactions: "\u0622\u062e\u0631 \u0639\u0645\u0644\u064a\u0627\u062a \u0627\u0644\u0646\u0642\u062f \u0648\u0627\u0644\u062f\u064a\u0646",
  time: "\u0627\u0644\u0648\u0642\u062a",
  product: "\u0627\u0644\u0645\u0646\u062a\u062c",
  qty: "\u0627\u0644\u0643\u0645\u064a\u0629",
  amount: "\u0627\u0644\u0645\u0628\u0644\u063a",
  payment: "\u0627\u0644\u062f\u0641\u0639",
  customer: "\u0627\u0644\u0639\u0645\u064a\u0644",
  noSales: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0628\u064a\u0639\u0627\u062a \u062d\u062a\u0649 \u0627\u0644\u0622\u0646.",
  revenue: "\u0627\u0644\u0625\u064a\u0631\u0627\u062f\u0627\u062a",
  last7Days: "\u0622\u062e\u0631 7 \u0623\u064a\u0627\u0645",
  salesByCategory: "\u0627\u0644\u0645\u0628\u064a\u0639\u0627\u062a \u062d\u0633\u0628 \u0627\u0644\u0645\u0646\u062a\u062c",
  topProductsThisMonth: "\u0623\u0641\u0636\u0644 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0647\u0630\u0627 \u0627\u0644\u0634\u0647\u0631",
  notifications: "\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a",
  stockHealthy: "\u0627\u0644\u0645\u062e\u0632\u0648\u0646 \u062c\u064a\u062f \u062d\u0627\u0644\u064a\u0627.",
  loginDetails: "\u062a\u0641\u0627\u0635\u064a\u0644 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
  appearance: "\u0627\u0644\u0645\u0638\u0647\u0631",
  language: "\u0627\u0644\u0644\u063a\u0629",
  shopDetails: "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u062a\u062c\u0631",
  light: "\u0641\u0627\u062a\u062d",
  dark: "\u062f\u0627\u0643\u0646",
  saveSettings: "\u062d\u0641\u0638 \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a",
  settingsIntro: "\u0627\u0644\u062d\u0633\u0627\u0628 \u0648\u0627\u0644\u0645\u0638\u0647\u0631 \u0648\u0627\u0644\u0644\u063a\u0629 \u0648\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u062a\u062c\u0631.",
  loggedEmail: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645",
  shopId: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062a\u062c\u0631",
  notAvailable: "\u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631"
};

const dictionary = {
  English: english,
  Somali: somali,
  Arabic: arabic
};

export function getSavedSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY);
  return saved ? JSON.parse(saved) : { theme: "light", language: "English" };
}

export function applyLanguage(language) {
  document.documentElement.lang = language === "Arabic" ? "ar" : language === "Somali" ? "so" : "en";
  document.documentElement.dir = language === "Arabic" ? "rtl" : "ltr";
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  document.documentElement.classList.toggle("dark", settings.theme === "dark");
  applyLanguage(settings.language);
  window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: settings }));
}

export function translate(language, key) {
  return dictionary[language]?.[key] || dictionary.English[key] || key;
}

export function useLanguage() {
  const [language, setLanguage] = React.useState(getSavedSettings().language || "English");

  React.useEffect(() => {
    applyLanguage(language);

    function handleLanguageChange(event) {
      setLanguage(event.detail?.language || getSavedSettings().language || "English");
    }

    window.addEventListener(LANGUAGE_EVENT, handleLanguageChange);
    window.addEventListener("storage", handleLanguageChange);
    return () => {
      window.removeEventListener(LANGUAGE_EVENT, handleLanguageChange);
      window.removeEventListener("storage", handleLanguageChange);
    };
  }, [language]);

  return {
    language,
    t: (key) => translate(language, key)
  };
}
