import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { nutricionApi } from "../api/nutricion";

/* ===================== SEED DE RECETAS ===================== */
/* Solo usa alimentos que existen en tu seed de backend:
   Frutas: Plátano, Manzana, Pera, Melocotón, Mandarina, Uva, Mango
   Verduras: Patata, Zanahoria, Calabacín, Calabaza, Brócoli, Judías verdes, Boniato
   Proteínas: Pollo, Pavo, Ternera, Merluza, Huevo
   Cereales: Galleta maría (sin azúcar), Pan, Arroz, Avena
*/
const RECIPES_SEED = [
  {
    title: "Calabacín + Patata (6m)",
    suitable_from: 6,
    freeze_ok: true,
    foods: ["Calabacín", "Patata"],
    steps:
      "Cocer al vapor ½ calabacín y ½ patata (10–12 min). Triturar fino. Añadir 1 cdita AOVE.",
  },
  {
    title: "Calabaza + Zanahoria (6m)",
    suitable_from: 6,
    freeze_ok: true,
    foods: ["Calabaza", "Zanahoria"],
    steps: "Cocer calabaza y zanahoria (12–15 min). Triturar fino. 1 cdita AOVE.",
  },
  {
    title: "Brócoli + Patata (6m)",
    suitable_from: 6,
    freeze_ok: true,
    foods: ["Brócoli", "Patata"],
    steps:
      "Cocer brócoli en ramilletes y patata (12–15 min). Triturar fino. 1 cdita AOVE.",
  },
  {
    title: "Judías verdes + Patata (6m)",
    suitable_from: 6,
    freeze_ok: true,
    foods: ["Judías verdes", "Patata"],
    steps:
      "Cocer 12–15 min. Quitar hebras a las judías. Triturar fino. 1 cdita AOVE.",
  },
  {
    title: "Boniato + Manzana (6m)",
    suitable_from: 6,
    freeze_ok: true,
    foods: ["Boniato", "Manzana"],
    steps: "Boniato al vapor 12–15 min + manzana 5–6 min. Triturar.",
  },
  {
    title: "Calabacín + Pera (6m)",
    suitable_from: 6,
    freeze_ok: true,
    foods: ["Calabacín", "Pera"],
    steps: "Calabacín 10–12 min + pera 4–5 min. Triturar.",
  },
  {
    title: "Zanahoria + Pera (6m)",
    suitable_from: 6,
    freeze_ok: true,
    foods: ["Zanahoria", "Pera"],
    steps: "Zanahoria 12 min + pera 4–5 min. Triturar.",
  },
  {
    title: "Pollo + Calabacín + Patata (6m)",
    suitable_from: 6,
    freeze_ok: true,
    foods: ["Pollo", "Calabacín", "Patata"],
    steps:
      "20–25 g pechuga + calabacín + patata (15–20 min). Triturar muy fino.",
  },
  {
    title: "Pavo + Calabaza + Patata (6m)",
    suitable_from: 6,
    freeze_ok: true,
    foods: ["Pavo", "Calabaza", "Patata"],
    steps: "Pavo + calabaza + patata (15–20 min). Triturar fino.",
  },
  {
    title: "Ternera + Calabacín + Patata (6m)",
    suitable_from: 6,
    freeze_ok: true,
    foods: ["Ternera", "Calabacín", "Patata"],
    steps: "Ternera magra 20–25 min + verdura. Triturar muy fino.",
  },
  {
    title: "Merluza + Patata + Zanahoria (6m, alérgeno)",
    suitable_from: 6,
    freeze_ok: true,
    foods: ["Merluza", "Patata", "Zanahoria"],
    steps:
      "Merluza sin piel/espinas (20 g) + patata + zanahoria (12–15 min). Triturar.",
  },
  {
    title: "Plátano + Manzana + Galleta (gluten) (6m)",
    suitable_from: 6,
    freeze_ok: true,
    foods: ["Plátano", "Manzana", "Galleta maría (sin azúcar)"],
    steps:
      "Manzana cocida 5–6 min. Triturar con ½ plátano y ½ galleta + 2–3 ctas de agua hasta puré espeso.",
  },
  {
    title: "Pera + Manzana (6m)",
    suitable_from: 6,
    freeze_ok: true,
    foods: ["Pera", "Manzana"],
    steps: "Cocer 5–6 min y triturar fino.",
  },
  {
    title: "Mango + Pera (6m)",
    suitable_from: 6,
    freeze_ok: true,
    foods: ["Mango", "Pera"],
    steps: "Pera 4–5 min + mango maduro. Triturar.",
  },
  {
    title: "Arroz con verduras (7–8m)",
    suitable_from: 7,
    freeze_ok: true,
    foods: ["Arroz", "Calabacín", "Zanahoria"],
    steps:
      "Arroz muy hecho (20 min) + calabacín + zanahoria. Triturar con algo de caldo.",
  },
  {
    title: "Avena con pera (7–8m)",
    suitable_from: 7,
    freeze_ok: true,
    foods: ["Avena", "Pera"],
    steps: "Cocer copos finos 5–6 min con agua; añadir pera cocida. Triturar.",
  },
  {
    title: "Ternera + calabaza + arroz (9–10m)",
    suitable_from: 9,
    freeze_ok: true,
    foods: ["Ternera", "Calabaza", "Arroz"],
    steps: "Ternera magra 25 min + calabaza + arroz muy hecho. Triturar.",
  },
  {
    title: "Pollo + brócoli + patata (9–10m)",
    suitable_from: 9,
    freeze_ok: true,
    foods: ["Pollo", "Brócoli", "Patata"],
    steps: "Variante proteica con brócoli. Triturar fino.",
  },
];

export default function AlimentacionRecetas() {
  // filtros
  const [suitableTo, setSuitableTo] = useState(6); // hasta mes
  const [foodId, setFoodId] = useState("");        // filtro por alimento
  // datos
  const [foods, setFoods] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // form nueva receta (opcional)
  const [openNew, setOpenNew] = useState(false);
  const [title, setTitle] = useState("");
  const [month, setMonth] = useState(6);
  const [steps, setSteps] = useState("");
  const [freezeOk, setFreezeOk] = useState(true);
  const [selectedFoodIds, setSelectedFoodIds] = useState([]);

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

  useEffect(() => { reload(); }, []);
  useEffect(() => { reload(); /* refresca al cambiar filtros */ }, [suitableTo, foodId]);

  const foodsByCat = useMemo(() => {
    const g = { fruta: [], verdura: [], proteina: [], cereal: [] };
    foods.forEach(f => g[f.category]?.push(f));
    Object.values(g).forEach(arr => arr.sort((a,b)=>a.name.localeCompare(b.name)));
    return g;
  }, [foods]);

  const toggleFoodSelect = (id) => {
    setSelectedFoodIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
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

  // ========= Seed de recetas (una sola vez) =========
  const seedOnce = async () => {
    if (localStorage.getItem("recipesSeeded") === "1") {
      const ok = confirm("Parece que ya cargaste las recetas base. ¿Quieres cargarlas de nuevo?");
      if (!ok) return;
    }
    try {
      const fs = await nutricionApi.foods();
      const idByName = Object.fromEntries(fs.map(f => [f.name, f.id]));

      for (const r of RECIPES_SEED) {
        const foodIds = (r.foods || []).map(n => idByName[n]).filter(Boolean);
        await nutricionApi.createRecipe({
          title: r.title,
          suitable_from: r.suitable_from,
          steps: r.steps,
          freeze_ok: r.freeze_ok,
          foodIds,
        });
      }
      localStorage.setItem("recipesSeeded", "1");
      await reload();
      alert("✅ Recetas base cargadas.");
    } catch (e) {
      console.error(e);
      alert("❌ No se pudieron cargar las recetas base.");
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

      {/* Filtros */}
      <div className="card p-3 shadow-sm mt-3">
        <div className="row g-3">
          <div className="col-12 col-sm-6">
            <label className="form-label">Hasta mes</label>
            <input
              type="number"
              min={4} max={12}
              className="form-control"
              value={suitableTo}
              onChange={(e)=>setSuitableTo(e.target.value)}
            />
          </div>
          <div className="col-12 col-sm-6">
            <label className="form-label">Filtrar por alimento</label>
            <select
              className="form-select"
              value={foodId}
              onChange={(e)=>setFoodId(e.target.value)}
            >
              <option value="">—</option>
              {foods.map(f=>(
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

      {/* ==== BOTÓN DE SEED (USAR UNA SOLA VEZ Y BORRAR) ==== */}
      <div className="alert alert-danger mt-3" role="alert">
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
          <div>
            <strong>⚠ Cargar recetas base</strong> — Úsalo <u>solo una vez</u> para poblar la base de datos, y luego <strong>bórralo</strong> de este archivo.
          </div>
          <button className="btn btn-danger" onClick={seedOnce}>
            Cargar recetas base (una vez)
          </button>
        </div>
      </div>

      {/* CTA nueva receta (opcional) */}
      <div className="mt-3 d-grid">
        <button className="btn btn-outline-dark" onClick={()=>setOpenNew(v=>!v)}>
          {openNew ? "Cerrar" : "➕ Nueva receta"}
        </button>
      </div>

      {openNew && (
        <div className="card p-3 shadow-sm mt-3">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Título</label>
              <input className="form-control" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Ej: Pollo + calabacín + patata" />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">Desde mes</label>
              <input type="number" min={4} max={12} className="form-control" value={month} onChange={(e)=>setMonth(e.target.value)} />
            </div>
            <div className="col-6 col-md-3 d-flex align-items-end">
              <div className="form-check">
                <input id="freezeok" className="form-check-input" type="checkbox" checked={freezeOk} onChange={(e)=>setFreezeOk(e.target.checked)} />
                <label htmlFor="freezeok" className="form-check-label">Se puede congelar</label>
              </div>
            </div>
            <div className="col-12">
              <label className="form-label">Pasos</label>
              <textarea className="form-control" rows={4} value={steps} onChange={(e)=>setSteps(e.target.value)} placeholder="Instrucciones paso a paso…" />
            </div>

            {/* selección de alimentos como chips */}
            <div className="col-12">
              <label className="form-label">Ingredientes (opcional)</label>
              {["fruta","verdura","proteina","cereal"].map(cat=>(
                <div key={cat} className="mb-2">
                  <div className="text-muted text-uppercase small mb-1">{cat}</div>
                  <div className="d-flex gap-2 flex-wrap">
                    {foodsByCat[cat].map(f=>(
                      <span
                        key={f.id}
                        role="button"
                        onClick={()=>toggleFoodSelect(f.id)}
                        className={`badge food-chip ${selectedFoodIds.includes(f.id) ? "text-bg-primary" : "text-bg-light"}`}
                      >
                        {f.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="d-grid mt-2">
            <button className="btn btn-primary" onClick={createRecipe}>Guardar receta</button>
          </div>
        </div>
      )}

      {/* Lista de recetas */}
      <div className="mt-4">
        {loading && <div className="text-muted">Cargando…</div>}
        {!loading && recipes.length === 0 && (
          <div className="text-muted">Sin recetas</div>
        )}

        <div className="row g-3">
          {recipes.map((r)=>(
            <div key={r.id ?? `${r.title}-${r.suitable_from}`} className="col-12">
              <div className="card card-recipe shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title m-0">{r.title}</h5>
                    <div className="d-flex gap-2">
                      <span className="badge text-bg-info chip">Desde {r.suitable_from}m</span>
                      <span className={`badge chip ${r.freeze_ok ? "text-bg-success" : "text-bg-secondary"}`}>
                        {r.freeze_ok ? "Congela ✓" : "Sin congelar"}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted small mt-2 mb-1">
                    Actualizado: {dayjs(r.created_at || new Date()).format("DD/MM/YYYY")}
                  </p>
                  <div className="mt-2" style={{whiteSpace:"pre-wrap"}}>{r.steps}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Nota */}
      <p className="text-muted small mt-4">
        Consejito: usa “Hasta mes” para ver sólo las recetas adecuadas a su edad. Si filtras por un alimento,
        verás recetas que lo incluyen (según lo tengas asociado al crear la receta).
      </p>
    </div>
  );
}
