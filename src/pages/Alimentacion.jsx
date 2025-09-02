import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es.js";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Link } from "react-router-dom";
import { nutricionApi } from "../api/nutricion";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

const MEALS = [
  { key: "manana", short: "M", label: "Mañana", cls: "secondary" },
  { key: "comida", short: "C", label: "Comida", cls: "primary" },
  { key: "merienda", short: "Me", label: "Merienda", cls: "info" },
  { key: "cena", short: "Ce", label: "Cena", cls: "dark" },
];

export default function Alimentacion() {
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));
  const [foods, setFoods] = useState([]);
  const [checks, setChecks] = useState([]);
  const [openDay, setOpenDay] = useState(null);
  const [initialMeal, setInitialMeal] = useState("comida");

  const start = dayjs(`${month}-01`);
  const daysInMonth = start.daysInMonth();
  const today = dayjs().format("YYYY-MM-DD");

  useEffect(() => { nutricionApi.foods().then(setFoods).catch(console.error); }, []);
  useEffect(() => { nutricionApi.checks(month).then(setChecks).catch(console.error); }, [month]);

  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => start.date(i + 1).format("YYYY-MM-DD")),
    [month]
  );

const byDate = useMemo(() => {
  const map = {};
  for (const c of checks) {
    // normaliza siempre a 'YYYY-MM-DD', venga como venga de la API
    const key = dayjs(c.date).format("YYYY-MM-DD");
    const item = { ...c, checked: !!c.checked }; // fuerza boolean
    (map[key] ||= []).push(item);
  }
  return map;
}, [checks]);

  const todayChecks = byDate[today] || [];
  const todayCounts = MEALS.reduce((acc, m) => {
    acc[m.key] = todayChecks.filter((c) => c.meal === m.key && c.checked).length;
    return acc;
  }, {});

  const openSheet = (date, meal) => {
    setInitialMeal(meal);
    setOpenDay(date);
  };

  const refreshChecks = async () => {
    const updated = await nutricionApi.checks(month);
    setChecks(updated);
  };

  return (
    <div className="container mt-4">
      <style>{`
        .grid-days { display:grid; grid-template-columns:repeat(3,1fr); gap:.75rem; }
        @media (min-width:576px){ .grid-days{ grid-template-columns:repeat(4,1fr);} }
        @media (min-width:992px){ .grid-days{ grid-template-columns:repeat(7,1fr);} }
        .day-card{
          border:1px solid #e5e7eb; border-radius:1rem; background:#fff;
          padding:.6rem .7rem; min-height:118px; display:flex; flex-direction:column; justify-content:space-between;
          box-shadow:0 1px 2px rgba(0,0,0,.03);
        }
        .weekday{ font-size:.75rem; color:#6c757d; text-transform:lowercase; }
        .day-num{ font-weight:600; font-size:1rem; }
        .badge-meal{ font-size:.75rem; padding:.35rem .45rem; border-radius:.6rem; }
        .pill { border-radius: 999px; }
        /* ---- BottomSheet mejorado móvil ---- */
        .bsv-toolbar { position:sticky; top:0; background:#fff; z-index:1; padding-bottom:.5rem; border-bottom:1px solid #eee; }
        .bsv-actions { position:sticky; bottom:0; background:#fff; padding:.5rem .25rem; border-top:1px solid #eee; z-index:1; }
        .cat-pills { overflow-x:auto; white-space:nowrap; -webkit-overflow-scrolling: touch; }
        .cat-pills .btn { margin-right:.4rem; }
        .food-item { border:1px solid #e5e7eb; border-radius:12px; padding:.65rem .75rem; display:flex; align-items:center; gap:.5rem; }
        .food-name { font-size:1rem; }
        .food-check { margin-left:auto; transform: scale(1.2); }
      `}</style>

      <h2 className="text-center">Alimentación</h2>

      {/* HOY */}
      <div className="card p-3 shadow-sm mt-3">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div className="text-muted text-uppercase small">{dayjs(today).format("dddd")}</div>
            <div className="h3 m-0">{dayjs(today).format("D [de] MMMM")}</div>
          </div>
          <button className="btn btn-outline-dark" onClick={() => setMonth(dayjs().format("YYYY-MM"))}>
            Hoy
          </button>
        </div>

        <div className="row g-3 mt-2">
          {MEALS.map((m) => (
            <div key={m.key} className="col-6 col-sm-3">
              <div className="border rounded-4 p-2 h-100">
                <div className="d-flex align-items-center justify-content-between">
                  <span className={`badge text-bg-${m.cls}`}>{m.short} · {m.label}</span>
                  <span className="badge text-bg-light text-muted">x{todayCounts[m.key] || 0}</span>
                </div>
                <div className="mt-2 d-flex gap-1 flex-wrap" style={{minHeight: 28}}>
  {todayChecks
    .filter(c => c.meal === m.key && c.checked)
    .map(c => (
      <span key={c.id} className="badge text-bg-light d-inline-flex align-items-center gap-1">
        {c.food_name}
        <button
          className="btn btn-danger btn-sm"
          title="Quitar"
          onClick={async (e) => {
            e.stopPropagation();
            await nutricionApi.setCheck({ date: today, foodId: c.food_id, meal: m.key, checked: false });
            await refreshChecks(); // ya la tienes declarada arriba
          }}
        >
          🗑️
        </button>
      </span>
  ))}
  {!(todayCounts[m.key] > 0) && <span className="text-muted small">Sin marcar</span>}
</div>
                <button className="btn btn-primary w-100 mt-2 pill" onClick={() => openSheet(today, m.key)}>
                  {m.label}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HOME */}
      <div className="mt-3 text-center">
        <Link to="/" className="btn btn-secondary">⬅ Volver a Home</Link>
      </div>

      {/* CALENDARIO MES (acordeón) */}
      <div className="accordion mt-4" id="acc-cal">
        <div className="accordion-item">
          <h2 className="accordion-header" id="acc-cal-head">
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#acc-cal-body"
              aria-expanded="false"
              aria-controls="acc-cal-body"
            >
              Calendario de {start.format("MMMM")} {start.format("YYYY")}
            </button>
          </h2>
          <div id="acc-cal-body" className="accordion-collapse collapse" aria-labelledby="acc-cal-head" data-bs-parent="#acc-cal">
            <div className="accordion-body">
              <div className="d-flex align-items-center justify-content-center mb-3">
                <div className="btn-group">
                  <button className="btn btn-outline-primary" onClick={() => setMonth(start.subtract(1, "month").format("YYYY-MM"))}>←</button>
                  <span className="btn btn-light text-capitalize">
                    {start.format("MMMM")} <span className="text-muted">{start.format("YYYY")}</span>
                  </span>
                  <button className="btn btn-outline-primary" onClick={() => setMonth(start.add(1, "month").format("YYYY-MM"))}>→</button>
                </div>
              </div>

              <MonthGrid
                days={days}
                byDate={byDate}
                onOpen={(d) => openSheet(d, "comida")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SHEET */}
      <BottomSheet
        openDay={openDay}
        initialMeal={initialMeal}
        onClose={() => setOpenDay(null)}
        foods={foods}
        checks={openDay ? byDate[openDay] || [] : []}
        onRefresh={async () => {
          const updated = await nutricionApi.checks(month);
          setChecks(updated);
        }}
      />
    </div>
  );
}

/* ===== Grid mensual ===== */
function MonthGrid({ days, byDate, onOpen }) {
  return (
    <>
      <style>{`
        .grid-days { display:grid; grid-template-columns:repeat(3,1fr); gap:.75rem; }
        @media (min-width:576px){ .grid-days{ grid-template-columns:repeat(4,1fr);} }
        @media (min-width:992px){ .grid-days{ grid-template-columns:repeat(7,1fr);} }
        .day-card{ border:1px solid #e5e7eb; border-radius:1rem; background:#fff; padding:.6rem .7rem; min-height:118px; display:flex; flex-direction:column; justify-content:space-between; }
        .weekday{ font-size:.75rem; color:#6c757d; text-transform:lowercase; }
        .day-num{ font-weight:600; font-size:1rem; }
        .badge-meal{ font-size:.72rem; }
      `}</style>
      <div className="grid-days">
        {days.map((d) => {
          const dc = (byDate[d] || []).map(c => ({ ...c, checked: !!c.checked }));
          const counts = MEALS.reduce((acc, m) => {
            acc[m.key] = dc.filter((c) => c.meal === m.key && c.checked).length;
            return acc;
          }, {});
          return (
            <button key={d} className="day-card text-start" onClick={() => onOpen(d)}>
              <div className="d-flex justify-content-between">
                <div className="weekday">{dayjs(d).format("ddd")}.</div>
                <div className="day-num">{dayjs(d).date()}</div>
              </div>
              <div className="d-flex gap-2 flex-wrap mt-1">
                {MEALS.map((m) => (
                  <span key={m.key} className={`badge text-bg-${m.cls} badge-meal`}>
                    {m.short}: {counts[m.key] || 0}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ===== BottomSheet mejorado móvil ===== */
function BottomSheet({ openDay, initialMeal = "comida", onClose, foods, checks, onRefresh }) {
  const ref = useRef(null);
  const [meal, setMeal] = useState(initialMeal);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedFoodIds, setSelectedFoodIds] = useState([]);
  const [alsoExposure, setAlsoExposure] = useState(true);
  const [notes, setNotes] = useState("");
  const [time, setTime] = useState(dayjs().format("HH:mm"));

  useEffect(() => {
    setMeal(initialMeal);
    setCategory("all");
    setSearch("");
    setAlsoExposure(true);
    setNotes("");
    setTime(dayjs().format("HH:mm"));
    const preset = checks.filter((c) => c.meal === initialMeal && c.checked).map((c) => c.food_id);
    setSelectedFoodIds(preset);
  }, [openDay, initialMeal, checks]);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let off;
    import("bootstrap/js/dist/offcanvas").then(({ default: Offcanvas }) => {
      off = Offcanvas.getOrCreateInstance(el, { backdrop: true, scroll: false });
      openDay ? off.show() : off.hide();
      el.addEventListener("hidden.bs.offcanvas", () => { if (openDay) onClose(); }, { once: true });
    });
    return () => { off && off.hide(); };
  }, [openDay]);

  if (!openDay) return null;

  const pills = [
    { key: "all", label: "Todas" },
    { key: "fruta", label: "Fruta" },
    { key: "verdura", label: "Verdura" },
    { key: "proteina", label: "Proteína" },
    { key: "cereal", label: "Cereal" },
  ];

  const list = foods
    .filter((f) => (category === "all" ? true : f.category === category))
    .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>a.name.localeCompare(b.name));

  const toggleFood = (id) => {
    setSelectedFoodIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedFoodIds([]);

  const onSave = async () => {
    try {
      const already = new Set(checks.filter((c) => c.meal === meal && c.checked).map((c) => c.food_id));
      const next = new Set(selectedFoodIds);
      const toEnable = [...next].filter((id) => !already.has(id));
      const toDisable = [...already].filter((id) => !next.has(id));

      await Promise.all([
        ...toEnable.map((id) => nutricionApi.setCheck({ date: openDay, foodId: id, meal, checked: true })),
        ...toDisable.map((id) => nutricionApi.setCheck({ date: openDay, foodId: id, meal, checked: false })),
      ]);

      if (alsoExposure && toEnable.length) {
        const note = [time ? `Hora: ${time}` : null, notes?.trim() || null].filter(Boolean).join(" · ");
        await Promise.all(
          toEnable.map((id) => nutricionApi.addExposure({ date: openDay, foodId: id, notes: note || undefined }))
        );
      }

      await onRefresh?.();
      onClose();
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar. Revisa la consola.");
    }
  };

  return (
    <div ref={ref} className="offcanvas offcanvas-bottom" tabIndex="-1" style={{ height: "86vh" }}>
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">
          {dayjs(openDay).format("ddd DD MMM")} · {MEALS.find((m) => m.key === meal)?.label}
        </h5>
        <button type="button" className="btn-close" onClick={onClose}></button>
      </div>

      <div className="offcanvas-body d-flex flex-column p-0">

        {/* Toolbar fija arriba */}
        <div className="bsv-toolbar px-3">
          <div className="row g-2">
            <div className="col-5">
              <label className="form-label small mb-1">Comida</label>
              <select className="form-select form-select-sm" value={meal} onChange={(e) => setMeal(e.target.value)}>
                <option value="manana">Mañana</option>
                <option value="comida">Comida</option>
                <option value="merienda">Merienda</option>
                <option value="cena">Cena</option>
              </select>
            </div>
            <div className="col-7">
              <label className="form-label small mb-1">Hora</label>
              <input type="time" className="form-control form-control-sm" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="col-12">
              <div className="cat-pills mt-1">
                {pills.map(p => (
                  <button
                    key={p.key}
                    type="button"
                    className={`btn btn-sm ${category === p.key ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setCategory(p.key)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-12">
              <input
                className="form-control form-control-sm"
                placeholder="Buscar alimento…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="col-12 d-flex align-items-center justify-content-between">
              <div className="form-check">
                <input
                  id="alsoExposure"
                  type="checkbox"
                  className="form-check-input"
                  checked={alsoExposure}
                  onChange={(e) => setAlsoExposure(e.target.checked)}
                />
                <label htmlFor="alsoExposure" className="form-check-label">Exposiciones (3 días)</label>
              </div>
              <small className="text-muted">Sel.: <strong>{selectedFoodIds.length}</strong></small>
            </div>
            <div className="col-12">
              <input
                className="form-control form-control-sm"
                placeholder="Notas para la exposición (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Lista scrollable */}
        <div className="flex-grow-1 px-3" style={{ overflowY: "auto" }}>
          {list.length === 0 && (
            <div className="text-center text-muted py-4">No hay alimentos</div>
          )}
          <div className="d-grid gap-2 py-2">
            {list.map((f) => {
              const isOn = selectedFoodIds.includes(f.id);
              return (
                <div
                  key={f.id}
                  className={`food-item ${isOn ? "bg-success-subtle border-success" : ""}`}
                  role="button"
                  onClick={() => toggleFood(f.id)}
                >
                  <span className="food-name">{f.name}</span>
                  {f.allergen && <span className="badge text-bg-warning ms-1">alérgeno</span>}
                  <input className="form-check-input food-check" type="checkbox" checked={isOn} readOnly />
                </div>
              );
            })}
          </div>
        </div>

        {/* Barra de acciones fija abajo */}
        <div className="bsv-actions d-flex justify-content-between align-items-center">
          <button className="btn btn-outline-secondary" onClick={clearSelection}>Quitar todo</button>
          <div className="d-flex gap-2">
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={onSave}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
