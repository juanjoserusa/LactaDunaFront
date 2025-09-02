import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { nutricionApi } from "../api/nutricion";

/* ========= Fecha de nacimiento fija =========
   Formato ISO: YYYY-MM-DD  ->  11/02/2025 */
const BIRTH_ISO = "2025-02-11";

/* ========= Helpers de edad (sin localStorage) ========= */
// Diferencia en meses naturales, redondeando hacia abajo
const monthsBetween = (fromISO, toDate = new Date()) => {
  if (!fromISO) return 6;
  const [y, m, d] = fromISO.split("-").map(Number);
  const from = new Date(y, m - 1, d); // fecha local
  const to = new Date(
    toDate.getFullYear(),
    toDate.getMonth(),
    toDate.getDate()
  );
  let months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());
  // Si todavía no ha llegado el día del mes, no se ha cumplido ese mes
  if (to.getDate() < from.getDate()) months -= 1;
  return Math.max(0, months);
};

// Límite útil para la vista (4..12 meses)
const clampSuitableTo = (n) => Math.min(Math.max(n, 4), 12);

/* ========= Constantes UI ========= */
const MEALS = [
  { key: "manana",   short: "M",  label: "Mañana",   cls: "secondary" },
  { key: "comida",   short: "C",  label: "Comida",   cls: "primary"   },
  { key: "merienda", short: "Me", label: "Merienda", cls: "info"      },
  { key: "cena",     short: "Ce", label: "Cena",     cls: "dark"      },
];

export default function AlimentacionRecetas() {
  // ✔️ suitableTo se calcula solo a partir de la F.Nac. + fecha actual
  const suitableTo = useMemo(
    () => clampSuitableTo(monthsBetween(BIRTH_ISO)),
    []
  );

  // filtros
  const [foodId, setFoodId] = useState(""); // filtro por alimento

  // datos
  const [foods, setFoods] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // form nueva receta (opcional, por si quieres crear desde la UI)
  const [openNew, setOpenNew] = useState(false);
  const [title, setTitle] = useState("");
  const [month, setMonth] = useState(6);
  const [steps, setSteps] = useState("");
  const [freezeOk, setFreezeOk] = useState(true);
  const [selectedFoodIds, setSelectedFoodIds] = useState([]);

  // opciones de “Marcar ahora”
  const [alsoExposure, setAlsoExposure] = useState(true);
  const [quickNote, setQuickNote] = useState("");
  const [quickTime, setQuickTime] = useState(dayjs().format("HH:mm"));

  const applyRecipe = async (recipe, mealKey) => {
    try {
      const today = dayjs().format("YYYY-MM-DD");
      const foodsInRecipe = Array.isArray(recipe.foods) ? recipe.foods : [];
      // backend /recipes devuelve alimentos con {id, name, ...}
      const foodIds = foodsInRecipe.map((f) => f.id).filter(Boolean);

      if (foodIds.length === 0) {
        alert("Esta receta no tiene ingredientes asociados en la base de datos.");
        return;
      }

      // 1) checks (calendario)
      await Promise.all(
        foodIds.map((id) =>
          nutricionApi.setCheck({
            date: today,
            foodId: id,
            meal: mealKey,
            checked: true,
          })
        )
      );

      // 2) exposiciones (opcional)
      if (alsoExposure) {
        const note = [quickTime ? `Hora: ${quickTime}` : null, quickNote?.trim() || null]
          .filter(Boolean)
          .join(" · ");
        await Promise.all(
          foodIds.map((id) =>
            nutricionApi.addExposure({
              date: today,
              foodId: id,
              notes: note || undefined,
            })
          )
        );
      }

      alert(
        `✅ Receta “${recipe.title}” marcada en ${
          MEALS.find((m) => m.key === mealKey)?.label || mealKey
        }.`
      );
    } catch (e) {
      console.error(e);
      alert("No se pudo marcar la receta. Revisa la consola.");
    }
  };

  const reload = async () => {
    setLoading(true);
    try {
      const [fs, rs] = await Promise.all([
        nutricionApi.foods(),
        nutricionApi.recipes({
          suitableTo: Number(suitableTo) || undefined,
          foodId: foodId ? Number(foodId) : undefined,
        }),
      ]);
      setFoods(fs);
      setRecipes(rs);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial y refresco cuando cambian filtros calculados
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suitableTo, foodId]);

  const foodsByCat = useMemo(() => {
    const g = { fruta: [], verdura: [], proteina: [], cereal: [] };
    foods.forEach((f) => g[f.category]?.push(f));
    Object.values(g).forEach((arr) => arr.sort((a, b) => a.name.localeCompare(b.name)));
    return g;
  }, [foods]);

  const toggleFoodSelect = (id) => {
    setSelectedFoodIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const createRecipe = async () => {
    if (!title.trim() || !month || !steps.trim()) {
      alert("Título, mes y pasos son obligatorios");
      return;
    }
    try {
      await nutricionApi.createRecipe({
        title: title.trim(),
        suitable_from: Number(month),
        steps: steps.trim(),
        freeze_ok: !!freezeOk,
        foodIds: selectedFoodIds,
      });
      // reset
      setTitle("");
      setMonth(6);
      setSteps("");
      setFreezeOk(true);
      setSelectedFoodIds([]);
      setOpenNew(false);
      await reload();
    } catch (e) {
      console.error(e);
      alert("No se pudo crear la receta.");
    }
  };

  return (
    <div className="container mt-4">
      <style>{`
        .pill{ border-radius:999px; }
        .chip{ font-size:.8rem; }
        .card-recipe{ border-radius:1rem; }
        .food-chip{ cursor:pointer; }
      `}</style>

      {/* Título */}
      <h2 className="text-center">Recetas</h2>

      {/* Navegación secundaria */}
      <div className="d-flex gap-2 justify-content-center mt-2">
        <Link to="/alimentacion" className="btn btn-outline-primary btn-sm">Calendario</Link>
        <Link to="/alimentacion/exposiciones" className="btn btn-outline-success btn-sm">Exposiciones</Link>
      </div>

      {/* Filtros (Hasta mes automático) */}
      <div className="card p-3 shadow-sm mt-3">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-sm-6">
            <div className="form-label m-0">Hasta mes</div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge text-bg-info chip">{suitableTo} meses (Meses de Duna)</span>
            
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <label className="form-label">Filtrar por alimento</label>
            <select
              className="form-select"
              value={foodId}
              onChange={(e) => setFoodId(e.target.value)}
            >
              <option value="">—</option>
              {foods.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} {f.allergen ? "(alérgeno)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Botón Home como el resto */}
      <div className="mt-3 text-center">
        <Link to="/" className="btn btn-secondary">⬅ Volver a Home</Link>
      </div>

      {/* CTA nueva receta (opcional) */}
      <div className="mt-3 d-grid">
        <button className="btn btn-outline-dark" onClick={() => setOpenNew((v) => !v)}>
          {openNew ? "Cerrar" : "➕ Nueva receta"}
        </button>
      </div>

      {openNew && (
        <div className="card p-3 shadow-sm mt-3">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Título</label>
              <input
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Pollo + calabacín + patata"
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">Desde mes</label>
              <input
                type="number"
                min={4}
                max={12}
                className="form-control"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-3 d-flex align-items-end">
              <div className="form-check">
                <input
                  id="freezeok"
                  className="form-check-input"
                  type="checkbox"
                  checked={freezeOk}
                  onChange={(e) => setFreezeOk(e.target.checked)}
                />
                <label htmlFor="freezeok" className="form-check-label">
                  Se puede congelar
                </label>
              </div>
            </div>
            <div className="col-12">
              <label className="form-label">Pasos</label>
              <textarea
                className="form-control"
                rows={4}
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder="Instrucciones paso a paso…"
              />
            </div>

            {/* selección de alimentos como chips */}
            <div className="col-12">
              <label className="form-label">Ingredientes (opcional)</label>
              {["fruta", "verdura", "proteina", "cereal"].map((cat) => {
                const list = foods.filter((f) => f.category === cat);
                return (
                  <div key={cat} className="mb-2">
                    <div className="text-muted text-uppercase small mb-1">{cat}</div>
                    <div className="d-flex gap-2 flex-wrap">
                      {list.map((f) => (
                        <span
                          key={f.id}
                          role="button"
                          onClick={() => toggleFoodSelect(f.id)}
                          className={`badge food-chip ${
                            selectedFoodIds.includes(f.id)
                              ? "text-bg-primary"
                              : "text-bg-light"
                          }`}
                        >
                          {f.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="d-grid mt-2">
            <button className="btn btn-primary" onClick={createRecipe}>
              Guardar receta
            </button>
          </div>
        </div>
      )}

      {/* Opciones rápidas para “Marcar ahora” */}
      <div className="card p-3 shadow-sm mt-3">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label">Exposiciones al marcar receta</label>
            <div className="form-check">
              <input
                id="alsoExposureFromRecipe"
                className="form-check-input"
                type="checkbox"
                checked={alsoExposure}
                onChange={(e) => setAlsoExposure(e.target.checked)}
              />
              <label htmlFor="alsoExposureFromRecipe" className="form-check-label">
                Guardar exposición por cada ingrediente
              </label>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label">Hora</label>
            <input
              type="time"
              className="form-control"
              value={quickTime}
              onChange={(e) => setQuickTime(e.target.value)}
            />
          </div>
          <div className="col-6 col-md-5">
            <label className="form-label">Notas (opcional)</label>
            <input
              className="form-control"
              placeholder="p. ej., se lo ha tomado bien"
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lista de recetas */}
      <div className="mt-4">
        {loading && <div className="text-muted">Cargando…</div>}
        {!loading && recipes.length === 0 && (
          <div className="text-muted">Sin recetas</div>
        )}

        <div className="row g-3">
          {recipes.map((r) => (
            <div
              key={r.id ?? `${r.title}-${r.suitable_from}`}
              className="col-12"
            >
              <div className="card card-recipe shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title m-0">{r.title}</h5>
                    <div className="d-flex gap-2">
                      <span className="badge text-bg-info chip">
                        Desde {r.suitable_from}m
                      </span>
                      <span
                        className={`badge chip ${
                          r.freeze_ok ? "text-bg-success" : "text-bg-secondary"
                        }`}
                      >
                        {r.freeze_ok ? "Congela ✓" : "Sin congelar"}
                      </span>
                    </div>
                  </div>

                  <p className="text-muted small mt-2 mb-1">
                    Actualizado:{" "}
                    {dayjs(r.created_at || new Date()).format("DD/MM/YYYY")}
                  </p>

                  <div className="mt-2" style={{ whiteSpace: "pre-wrap" }}>
                    {r.steps}
                  </div>

                    {/* Acciones: marcar receta ahora en una comida */}
                  <div className="mt-3">
                    <div className="small text-muted mb-1">
                      Marcar esta receta ahora en:
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {MEALS.map((m) => (
                        <button
                          key={m.key}
                          className={`btn btn-${m.cls} btn-sm`}
                          onClick={() => applyRecipe(r, m.key)}
                          title={`Marcar en ${m.label} (hoy)`}
                        >
                          {m.short} · {m.label}
                        </button>
                      ))}
                    </div>

                    {/* Chips de ingredientes (si vienen del backend con /recipes) */}
                    {Array.isArray(r.foods) && r.foods.length > 0 && (
                      <div className="mt-2 d-flex gap-2 flex-wrap">
                        {r.foods.map((f) => (
                          <span
                            key={f.id ?? f.name}
                            className="badge text-bg-light chip"
                          >
                            {f.name}
                            {f.allergen ? " (alérgeno)" : ""}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nota */}
      <p className="text-muted small mt-4">
        El filtro “Hasta mes” se calcula automáticamente con la fecha de
        nacimiento ({dayjs(BIRTH_ISO).format("DD/MM/YYYY")}). Si hoy aún no ha llegado
        el día 11, no cuenta el mes nuevo.
      </p>
    </div>
  );
}
