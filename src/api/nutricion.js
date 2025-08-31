import axios from "axios";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, ""); // sin barra final

if (!API) {
  console.warn("⚠️ VITE_API_URL no definida. Edita .env.local en el frontend.");
}

const http = axios.create({
  baseURL: API || "/",         // si no hay env, quedará relativo (no recomendado)
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export const nutricionApi = {
  // Foods
  async foods(category) {
    const { data } = await http.get("/foods", {
      params: category ? { category } : undefined,
    });
    return data;
  },

  // Checks (calendario)
  async checks(month) {
    const { data } = await http.get("/checks", { params: { month } });
    return data;
  },
  async setCheck({ date, foodId, meal, checked }) {
    const { data } = await http.post("/checks", { date, foodId, meal, checked });
    return data;
  },

  // Exposiciones
  async exposures(from, to) {
    const { data } = await http.get("/exposures", { params: { from, to } });
    return data;
    },
  async addExposure({ date, foodId, notes }) {
    const { data } = await http.post("/exposures", { date, foodId, notes });
    return data;
  },
  async setExposureOutcome({ foodId, outcome }) {
    const { data } = await http.post("/exposures/outcome", { foodId, outcome });
    return data;
  },

  // Recetas
  async recipes({ suitableTo, foodId } = {}) {
    const { data } = await http.get("/recipes", { params: { suitableTo, foodId } });
    return data;
  },
  async createRecipe(payload) {
    const { data } = await http.post("/recipes", payload);
    return data;
  },
};
