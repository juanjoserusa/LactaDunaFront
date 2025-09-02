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
  /* ===== VERDURAS (6m) ===== */
  { title: "Calabacín + Patata", suitable_from: 6, freeze_ok: true, foods: ["Calabacín","Patata"], steps: "Pelar ½ calabacín y ½ patata. Cocer 12 min. Triturar fino. Añadir 1 cdita AOVE." },
  { title: "Calabaza + Zanahoria", suitable_from: 6, freeze_ok: true, foods: ["Calabaza","Zanahoria"], steps: "Trocear 100 g calabaza + 1 zanahoria. Cocer 15 min. Triturar." },
  { title: "Boniato + Patata", suitable_from: 6, freeze_ok: true, foods: ["Boniato","Patata"], steps: "Trocear ½ boniato + ½ patata. Cocer 15 min. Triturar." },
  { title: "Judías verdes + Patata", suitable_from: 6, freeze_ok: true, foods: ["Judías verdes","Patata"], steps: "Quitar hebras, cortar judías + ½ patata. Cocer 15 min. Triturar." },
  { title: "Brócoli + Patata", suitable_from: 6, freeze_ok: true, foods: ["Brócoli","Patata"], steps: "Ramilletes de brócoli + ½ patata. Cocer 12 min. Triturar." },
  { title: "Zanahoria + Calabacín", suitable_from: 6, freeze_ok: true, foods: ["Zanahoria","Calabacín"], steps: "Cortar 1 zanahoria + ½ calabacín. Cocer 12 min. Triturar." },
  { title: "Calabaza + Calabacín", suitable_from: 6, freeze_ok: true, foods: ["Calabaza","Calabacín"], steps: "Trocear 100 g calabaza + ½ calabacín. Cocer 15 min. Triturar." },
  { title: "Boniato + Calabaza", suitable_from: 6, freeze_ok: true, foods: ["Boniato","Calabaza"], steps: "Trocear ½ boniato + 100 g calabaza. Cocer 15 min. Triturar." },
  { title: "Judías verdes + Zanahoria", suitable_from: 6, freeze_ok: true, foods: ["Judías verdes","Zanahoria"], steps: "Trocear 100 g judías + 1 zanahoria. Cocer 15 min. Triturar." },
  { title: "Coliflor + Patata", suitable_from: 6, freeze_ok: true, foods: ["Coliflor","Patata"], steps: "Trocear 100 g coliflor + ½ patata. Cocer 12 min. Triturar." },
  { title: "Brócoli + Zanahoria", suitable_from: 6, freeze_ok: true, foods: ["Brócoli","Zanahoria"], steps: "Trocear 100 g brócoli + 1 zanahoria. Cocer 12 min. Triturar." },
  { title: "Boniato + Brócoli", suitable_from: 6, freeze_ok: true, foods: ["Boniato","Brócoli"], steps: "Trocear ½ boniato + brócoli. Cocer 12–15 min. Triturar." },
  { title: "Coliflor + Zanahoria", suitable_from: 6, freeze_ok: true, foods: ["Coliflor","Zanahoria"], steps: "Trocear coliflor + zanahoria. Cocer 12 min. Triturar." },
  { title: "Calabacín + Zanahoria + Patata", suitable_from: 6, freeze_ok: true, foods: ["Calabacín","Zanahoria","Patata"], steps: "Trocear todo. Cocer 15 min. Triturar." },
  { title: "Calabaza + Judías verdes", suitable_from: 6, freeze_ok: true, foods: ["Calabaza","Judías verdes"], steps: "Trocear calabaza + judías. Cocer 15 min. Triturar." },
  { title: "Guisantes + Patata", suitable_from: 6, freeze_ok: true, foods: ["Guisantes","Patata"], steps: "Trocear guisantes + ½ patata. Cocer 12 min. Triturar fino." },
  { title: "Calabaza + Brócoli", suitable_from: 6, freeze_ok: true, foods: ["Calabaza","Brócoli"], steps: "Trocear calabaza + brócoli. Cocer 12 min. Triturar." },
  { title: "Boniato + Calabaza + Zanahoria", suitable_from: 6, freeze_ok: true, foods: ["Boniato","Calabaza","Zanahoria"], steps: "Trocear ½ boniato + calabaza + zanahoria. Cocer 15 min. Triturar." },
  { title: "Judías verdes + Calabacín + Patata", suitable_from: 6, freeze_ok: true, foods: ["Judías verdes","Calabacín","Patata"], steps: "Trocear todo. Cocer 15 min. Triturar." },
  { title: "Calabacín + Coliflor", suitable_from: 6, freeze_ok: true, foods: ["Calabacín","Coliflor"], steps: "Trocear ½ calabacín + coliflor. Cocer 12 min. Triturar." },

  /* ===== FRUTAS (6m) ===== */
  { title: "Pera + Manzana", suitable_from: 6, freeze_ok: true, foods: ["Pera","Manzana"], steps: "Cocer pera + manzana 5–6 min. Triturar." },
  { title: "Plátano + Pera", suitable_from: 6, freeze_ok: false, foods: ["Plátano","Pera"], steps: "Machacar plátano maduro con pera cocida 4 min." },
  { title: "Manzana + Ciruela", suitable_from: 6, freeze_ok: true, foods: ["Manzana","Ciruela"], steps: "Cocer ½ manzana + ½ ciruela sin hueso 5 min. Triturar." },
  { title: "Melocotón + Pera", suitable_from: 6, freeze_ok: true, foods: ["Melocotón","Pera"], steps: "Cocer melocotón + pera 5 min. Triturar." },
  { title: "Mango + Pera", suitable_from: 6, freeze_ok: false, foods: ["Mango","Pera"], steps: "Cocer pera 4 min y triturar con mango maduro." },
  { title: "Mango + Plátano", suitable_from: 6, freeze_ok: false, foods: ["Mango","Plátano"], steps: "Machacar mango maduro + ½ plátano. Sin cocción." },
  { title: "Ciruela + Plátano", suitable_from: 6, freeze_ok: false, foods: ["Ciruela","Plátano"], steps: "Machacar ½ plátano + ½ ciruela madura." },
  { title: "Manzana + Melón", suitable_from: 6, freeze_ok: false, foods: ["Manzana","Melón"], steps: "Cocer ½ manzana 5 min, triturar con melón maduro." },
  { title: "Sandía + Pera", suitable_from: 6, freeze_ok: false, foods: ["Sandía","Pera"], steps: "Triturar sandía sin pepitas + pera madura." },
  { title: "Plátano + Kiwi", suitable_from: 6, freeze_ok: false, foods: ["Plátano","Kiwi"], steps: "Machacar plátano + kiwi muy maduro (sin semillas duras)." },
  { title: "Mandarina + Manzana", suitable_from: 6, freeze_ok: false, foods: ["Mandarina","Manzana"], steps: "Cocer manzana 5 min, triturar con gajos de mandarina sin piel." },
  { title: "Uva + Pera", suitable_from: 6, freeze_ok: false, foods: ["Uva","Pera"], steps: "Quitar piel y pepitas a las uvas, triturar con pera cocida." },
  { title: "Melocotón + Mango", suitable_from: 6, freeze_ok: false, foods: ["Melocotón","Mango"], steps: "Triturar melocotón sin piel con mango maduro." },
  { title: "Plátano + Melón", suitable_from: 6, freeze_ok: false, foods: ["Plátano","Melón"], steps: "Machacar plátano con melón maduro." },
  { title: "Manzana + Pera + Ciruela", suitable_from: 6, freeze_ok: true, foods: ["Manzana","Pera","Ciruela"], steps: "Cocer todo 5 min. Triturar fino." },
  { title: "Mango + Pera + Plátano", suitable_from: 6, freeze_ok: false, foods: ["Mango","Pera","Plátano"], steps: "Triturar fruta madura, sin cocción." },
  { title: "Manzana + Uva", suitable_from: 6, freeze_ok: false, foods: ["Manzana","Uva"], steps: "Quitar piel/pepitas a uvas, triturar con manzana cocida." },
  { title: "Sandía + Plátano", suitable_from: 6, freeze_ok: false, foods: ["Sandía","Plátano"], steps: "Triturar sandía sin pepitas con ½ plátano maduro." },
  { title: "Melón + Pera", suitable_from: 6, freeze_ok: false, foods: ["Melón","Pera"], steps: "Triturar melón con pera madura." },
  { title: "Plátano + Mandarina", suitable_from: 6, freeze_ok: false, foods: ["Plátano","Mandarina"], steps: "Machacar plátano con gajos de mandarina sin piel." },

  /* ===== CARNES (7–10m) ===== */
  { title: "Pollo + Calabacín + Patata", suitable_from: 6, freeze_ok: true, foods: ["Pollo","Calabacín","Patata"], steps: "Cocer 20 g pollo + patata + calabacín 20 min. Triturar fino." },
  { title: "Pavo + Calabaza + Arroz", suitable_from: 7, freeze_ok: true, foods: ["Pavo","Calabaza","Arroz"], steps: "Cocer pavo + calabaza + 2 cdas arroz 20 min. Triturar." },
  { title: "Ternera + Zanahoria + Patata", suitable_from: 7, freeze_ok: true, foods: ["Ternera","Zanahoria","Patata"], steps: "Cocer ternera magra + zanahoria + patata 25 min. Triturar fino." },
  { title: "Conejo + Calabaza + Boniato", suitable_from: 7, freeze_ok: true, foods: ["Conejo","Calabaza","Boniato"], steps: "Cocer conejo sin hueso + calabaza + boniato 20 min. Triturar." },
  { title: "Pollo + Brócoli + Arroz", suitable_from: 8, freeze_ok: true, foods: ["Pollo","Brócoli","Arroz"], steps: "Cocer pollo + brócoli + arroz 20 min. Triturar fino." },
  { title: "Pavo + Calabacín + Patata", suitable_from: 7, freeze_ok: true, foods: ["Pavo","Calabacín","Patata"], steps: "Cocer 20 g pavo + calabacín + patata 20 min. Triturar." },
  { title: "Ternera + Calabaza + Arroz", suitable_from: 9, freeze_ok: true, foods: ["Ternera","Calabaza","Arroz"], steps: "Cocer 30 g ternera magra + calabaza + arroz 25 min. Triturar." },
  { title: "Pollo + Boniato + Zanahoria", suitable_from: 8, freeze_ok: true, foods: ["Pollo","Boniato","Zanahoria"], steps: "Cocer pollo + boniato + zanahoria 20 min. Triturar." },
  { title: "Conejo + Brócoli + Patata", suitable_from: 8, freeze_ok: true, foods: ["Conejo","Brócoli","Patata"], steps: "Cocer conejo + brócoli + patata 20 min. Triturar." },
  { title: "Pavo + Zanahoria + Calabaza", suitable_from: 7, freeze_ok: true, foods: ["Pavo","Zanahoria","Calabaza"], steps: "Cocer pavo + zanahoria + calabaza 20 min. Triturar." },
  { title: "Pollo + Guisantes + Arroz", suitable_from: 8, freeze_ok: true, foods: ["Pollo","Guisantes","Arroz"], steps: "Cocer pollo + guisantes + arroz 20 min. Triturar." },
  { title: "Ternera + Judías verdes + Patata", suitable_from: 8, freeze_ok: true, foods: ["Ternera","Judías verdes","Patata"], steps: "Cocer ternera magra + judías + patata 25 min. Triturar fino." },
  { title: "Conejo + Calabacín + Arroz", suitable_from: 9, freeze_ok: true, foods: ["Conejo","Calabacín","Arroz"], steps: "Cocer conejo + calabacín + arroz 25 min. Triturar." },
  { title: "Pollo + Coliflor + Patata", suitable_from: 8, freeze_ok: true, foods: ["Pollo","Coliflor","Patata"], steps: "Cocer pollo + coliflor + patata 20 min. Triturar." },
  { title: "Ternera + Boniato + Zanahoria", suitable_from: 9, freeze_ok: true, foods: ["Ternera","Boniato","Zanahoria"], steps: "Cocer ternera magra + boniato + zanahoria 25 min. Triturar." },
  { title: "Pavo + Brócoli + Calabaza", suitable_from: 8, freeze_ok: true, foods: ["Pavo","Brócoli","Calabaza"], steps: "Cocer pavo + brócoli + calabaza 20 min. Triturar." },
  { title: "Pollo + Calabaza + Patata", suitable_from: 7, freeze_ok: true, foods: ["Pollo","Calabaza","Patata"], steps: "Cocer pollo + calabaza + patata 20 min. Triturar." },
  { title: "Conejo + Zanahoria + Patata", suitable_from: 8, freeze_ok: true, foods: ["Conejo","Zanahoria","Patata"], steps: "Cocer conejo + zanahoria + patata 25 min. Triturar fino." },
  { title: "Pavo + Boniato + Arroz", suitable_from: 8, freeze_ok: true, foods: ["Pavo","Boniato","Arroz"], steps: "Cocer pavo + boniato + arroz 20 min. Triturar." },
  { title: "Pollo + Calabacín + Zanahoria", suitable_from: 7, freeze_ok: true, foods: ["Pollo","Calabacín","Zanahoria"], steps: "Cocer pollo + calabacín + zanahoria 20 min. Triturar." },

  /* ===== PESCADOS (7–10m, alérgenos) ===== */
  { title: "Merluza + Patata + Zanahoria", suitable_from: 7, freeze_ok: true, foods: ["Merluza","Patata","Zanahoria"], steps: "Cocer 20 g merluza + patata + zanahoria 15 min. Triturar fino." },
  { title: "Dorada + Calabacín + Patata", suitable_from: 7, freeze_ok: true, foods: ["Dorada","Calabacín","Patata"], steps: "Cocer dorada sin espinas + calabacín + patata 15 min. Triturar." },
  { title: "Lenguado + Calabaza + Arroz", suitable_from: 8, freeze_ok: true, foods: ["Lenguado","Calabaza","Arroz"], steps: "Cocer 20 g lenguado + calabaza + arroz 20 min. Triturar." },
  { title: "Salmón + Brócoli + Patata", suitable_from: 9, freeze_ok: true, foods: ["Salmón","Brócoli","Patata"], steps: "Cocer 15 g salmón fresco + brócoli + patata 15 min. Triturar." },
  { title: "Merluza + Calabaza + Zanahoria", suitable_from: 7, freeze_ok: true, foods: ["Merluza","Calabaza","Zanahoria"], steps: "Cocer merluza + calabaza + zanahoria 15 min. Triturar." },
  { title: "Dorada + Boniato + Calabacín", suitable_from: 8, freeze_ok: true, foods: ["Dorada","Boniato","Calabacín"], steps: "Cocer dorada + boniato + calabacín 15 min. Triturar." },
  { title: "Lenguado + Patata + Zanahoria", suitable_from: 8, freeze_ok: true, foods: ["Lenguado","Patata","Zanahoria"], steps: "Cocer lenguado + patata + zanahoria 15 min. Triturar fino." },
  { title: "Salmón + Calabaza + Patata", suitable_from: 9, freeze_ok: true, foods: ["Salmón","Calabaza","Patata"], steps: "Cocer salmón + calabaza + patata 15 min. Triturar." },
  { title: "Merluza + Brócoli + Arroz", suitable_from: 8, freeze_ok: true, foods: ["Merluza","Brócoli","Arroz"], steps: "Cocer merluza + brócoli + arroz 20 min. Triturar." },
  { title: "Dorada + Judías verdes + Patata", suitable_from: 8, freeze_ok: true, foods: ["Dorada","Judías verdes","Patata"], steps: "Cocer dorada + judías + patata 15 min. Triturar fino." },

  /* ===== CEREALES Y LEGUMBRES (7–10m) ===== */
  { title: "Arroz + Calabacín + Zanahoria", suitable_from: 7, freeze_ok: true, foods: ["Arroz","Calabacín","Zanahoria"], steps: "Cocer arroz 20 min + calabacín + zanahoria. Triturar con caldo." },
  { title: "Avena + Pera", suitable_from: 7, freeze_ok: true, foods: ["Avena","Pera"], steps: "Cocer copos finos 5 min en agua. Añadir pera cocida y triturar." },
  { title: "Sémola + Manzana", suitable_from: 7, freeze_ok: true, foods: ["Sémola","Manzana"], steps: "Cocer 2 cdas sémola 5 min. Triturar con manzana cocida." },
  { title: "Lenteja roja + Zanahoria + Patata", suitable_from: 9, freeze_ok: true, foods: ["Lenteja roja","Zanahoria","Patata"], steps: "Cocer lentejas + zanahoria + patata 25 min. Triturar." },
  { title: "Garbanzo pelado + Calabaza", suitable_from: 10, freeze_ok: true, foods: ["Garbanzo pelado","Calabaza"], steps: "Cocer garbanzos remojados + calabaza 40 min. Triturar fino." },
  { title: "Arroz + Pera + Manzana", suitable_from: 8, freeze_ok: true, foods: ["Arroz","Pera","Manzana"], steps: "Cocer arroz 20 min. Triturar con fruta cocida." },
  { title: "Avena + Plátano", suitable_from: 7, freeze_ok: true, foods: ["Avena","Plátano"], steps: "Cocer copos 5 min, triturar con plátano maduro." },
  { title: "Lenteja roja + Calabacín + Patata", suitable_from: 9, freeze_ok: true, foods: ["Lenteja roja","Calabacín","Patata"], steps: "Cocer lentejas + calabacín + patata 25 min. Triturar." },
  { title: "Garbanzo + Zanahoria + Boniato", suitable_from: 10, freeze_ok: true, foods: ["Garbanzo","Zanahoria","Boniato"], steps: "Cocer garbanzos + zanahoria + boniato 40 min. Triturar fino." },
  { title: "Arroz + Mango + Plátano", suitable_from: 8, freeze_ok: true, foods: ["Arroz","Mango","Plátano"], steps: "Cocer arroz 20 min. Triturar con fruta madura." },

  /* ===== COMBINADOS AVANZADOS (9–10m) ===== */
  { title: "Pollo + Brócoli + Patata + Arroz", suitable_from: 9, freeze_ok: true, foods: ["Pollo","Brócoli","Patata","Arroz"], steps: "Cocer pollo + brócoli + patata + arroz 25 min. Triturar." },
  { title: "Pavo + Calabaza + Boniato + Arroz", suitable_from: 9, freeze_ok: true, foods: ["Pavo","Calabaza","Boniato","Arroz"], steps: "Cocer todo 25 min. Triturar." },
  { title: "Ternera + Judías verdes + Patata + Calabacín", suitable_from: 9, freeze_ok: true, foods: ["Ternera","Judías verdes","Patata","Calabacín"], steps: "Cocer ternera + verduras 25 min. Triturar fino." },
  { title: "Conejo + Zanahoria + Arroz + Calabaza", suitable_from: 9, freeze_ok: true, foods: ["Conejo","Zanahoria","Arroz","Calabaza"], steps: "Cocer conejo + verduras + arroz 25 min. Triturar." },
  { title: "Merluza + Calabacín + Patata + Zanahoria", suitable_from: 9, freeze_ok: true, foods: ["Merluza","Calabacín","Patata","Zanahoria"], steps: "Cocer merluza + verduras 20 min. Triturar fino." },
  { title: "Dorada + Calabaza + Arroz + Zanahoria", suitable_from: 9, freeze_ok: true, foods: ["Dorada","Calabaza","Arroz","Zanahoria"], steps: "Cocer dorada + verduras + arroz 20 min. Triturar." },
  { title: "Pollo + Guisantes + Patata + Zanahoria", suitable_from: 9, freeze_ok: true, foods: ["Pollo","Guisantes","Patata","Zanahoria"], steps: "Cocer pollo + verduras 25 min. Triturar." },
  { title: "Pavo + Brócoli + Boniato + Arroz", suitable_from: 9, freeze_ok: true, foods: ["Pavo","Brócoli","Boniato","Arroz"], steps: "Cocer todo 25 min. Triturar." },
  { title: "Salmón + Patata + Calabacín + Zanahoria", suitable_from: 10, freeze_ok: true, foods: ["Salmón","Patata","Calabacín","Zanahoria"], steps: "Cocer salmón + verduras 20 min. Triturar." },
  { title: "Lenguado + Brócoli + Patata + Arroz", suitable_from: 10, freeze_ok: true, foods: ["Lenguado","Brócoli","Patata","Arroz"], steps: "Cocer lenguado + verduras + arroz 20 min. Triturar." }
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
  const [alsoExposure, setAlsoExposure] = useState(true);
const [quickNote, setQuickNote] = useState("");
const [quickTime, setQuickTime] = useState(dayjs().format("HH:mm"));

  const MEALS = [
  { key: "manana", short: "M", label: "Mañana", cls: "secondary" },
  { key: "comida", short: "C", label: "Comida", cls: "primary" },
  { key: "merienda", short: "Me", label: "Merienda", cls: "info" },
  { key: "cena", short: "Ce", label: "Cena", cls: "dark" },
];

  const applyRecipe = async (recipe, mealKey) => {
  try {
    const today = dayjs().format("YYYY-MM-DD");
    const foodsInRecipe = Array.isArray(recipe.foods) ? recipe.foods : [];
    const foodIds = foodsInRecipe.map(f => f.id).filter(Boolean);

    if (foodIds.length === 0) {
      alert("Esta receta no tiene ingredientes asociados en la base de datos.");
      return;
    }

    // 1) checks (calendario)
    await Promise.all(
      foodIds.map(id =>
        nutricionApi.setCheck({ date: today, foodId: id, meal: mealKey, checked: true })
      )
    );

    // 2) exposiciones (opcional)
    if (alsoExposure) {
      const note = [quickTime ? `Hora: ${quickTime}` : null, quickNote?.trim() || null]
        .filter(Boolean)
        .join(" · ");
      await Promise.all(
        foodIds.map(id =>
          nutricionApi.addExposure({ date: today, foodId: id, notes: note || undefined })
        )
      );
    }

    alert(`✅ Receta “${recipe.title}” marcada en ${MEALS.find(m=>m.key===mealKey)?.label || mealKey}.`);
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

      {/* ==== BOTÓN DE SEED (USAR UNA SOLA VEZ Y BORRAR) ====
      <div className="alert alert-danger mt-3" role="alert">
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
          <div>
            <strong>⚠ Cargar recetas base</strong> — Úsalo <u>solo una vez</u> para poblar la base de datos, y luego <strong>bórralo</strong> de este archivo.
          </div>
          <button className="btn btn-danger" onClick={seedOnce}>
            Cargar recetas base (una vez)
          </button>
        </div>
      </div> */}

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
          onChange={(e)=>setAlsoExposure(e.target.checked)}
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
        onChange={(e)=>setQuickTime(e.target.value)}
      />
    </div>
    <div className="col-6 col-md-5">
      <label className="form-label">Notas (opcional)</label>
      <input
        className="form-control"
        placeholder="p. ej., se lo ha tomado bien"
        value={quickNote}
        onChange={(e)=>setQuickNote(e.target.value)}
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

          <div className="mt-2" style={{ whiteSpace: "pre-wrap" }}>
            {r.steps}
          </div>

          {/* Acciones: marcar receta ahora en una comida */}
          <div className="mt-3">
            <div className="small text-muted mb-1">Marcar esta receta ahora en:</div>
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
                  <span key={f.id ?? f.name} className="badge text-bg-light chip">
                    {f.name}{f.allergen ? " (alérgeno)" : ""}
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
        Consejito: usa “Hasta mes” para ver sólo las recetas adecuadas a su edad. Si filtras por un alimento,
        verás recetas que lo incluyen (según lo tengas asociado al crear la receta).
      </p>
    </div>
  );
}
