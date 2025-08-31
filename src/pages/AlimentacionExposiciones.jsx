import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { nutricionApi } from "../api/nutricion";

export default function AlimentacionExposiciones() {
  const [from] = useState(dayjs().subtract(45, "day").format("YYYY-MM-DD"));
  const [to] = useState(dayjs().format("YYYY-MM-DD"));
  const [expos, setExpos] = useState([]);
  const [foods, setFoods] = useState([]);
  const [foodId, setFoodId] = useState("");
  const [notes, setNotes] = useState("");

  const reload = async () => {
    const [e, f] = await Promise.all([
      nutricionApi.exposures(from, to),
      nutricionApi.foods(),
    ]);
    setExpos(e);
    setFoods(f);
  };

  useEffect(() => {
    reload();
  }, []);

  async function addToday() {
    if (!foodId) return;
    try {
      await nutricionApi.addExposure({
        date: dayjs().format("YYYY-MM-DD"),
        foodId: Number(foodId),
        notes: notes || undefined,
      });
      setNotes("");
      await reload();
    } catch (e) {
      console.error(e);
      alert("No se pudo registrar la exposición de hoy.");
    }
  }

  // agrupar por alimento
  const groups = useMemo(() => {
    const by = expos.reduce((acc, e) => {
      (acc[e.food_id] ||= []).push(e);
      return acc;
    }, {});
    // ordenar interno por fecha ASC
    Object.values(by).forEach((arr) =>
      arr.sort((a, b) => a.date.localeCompare(b.date))
    );
    // ordenar grupos: primero “En prueba / Valorar”, luego “Tolerado”, alfabético
    return Object.values(by).sort((a, b) => {
      const ta = a.some((x) => x.tolerated) ? 1 : 0;
      const tb = b.some((x) => x.tolerated) ? 1 : 0;
      if (ta !== tb) return ta - tb;
      return a[0].food_name.localeCompare(b[0].food_name);
    });
  }, [expos]);

  return (
    <div className="container mt-4">
      <style>{`
        .pill { border-radius:999px; }
        .chip { font-size:.8rem; }
      `}</style>

      {/* Título */}
      <h2 className="text-center">
        Exposiciones <span className="text-muted">(3 días)</span>
      </h2>

      {/* CTA navegación secundaria */}
      <div className="d-flex gap-2 justify-content-center mt-2">
        <Link to="/alimentacion" className="btn btn-outline-primary btn-sm">
          Calendario
        </Link>
        <Link to="/alimentacion/recetas" className="btn btn-outline-success btn-sm">
          Recetas
        </Link>
      </div>

      {/* Card de alta rápida */}
      <div className="card p-3 shadow-sm mt-3">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label">Alimento</label>
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
          <div className="col-12 col-md-8">
            <label className="form-label">Notas</label>
            <input
              className="form-control"
              placeholder="gases, bien, erupción leve…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <button className="btn btn-primary mt-3 w-100" onClick={addToday}>
          Añadir exposición hoy
        </button>
      </div>

      {/* Botón Home como el resto */}
      <div className="mt-3 text-center">
        <Link to="/" className="btn btn-secondary">
          ⬅ Volver a Home
        </Link>
      </div>

      {/* Listado de alimentos con progreso */}
      <div className="mt-4">
        <h4 className="mb-3">Progreso por alimento</h4>

        {groups.length === 0 && (
          <div className="text-muted">Aún no hay exposiciones registradas.</div>
        )}

        <div className="row g-3">
          {groups.map((items) => {
            const name = items[0].food_name;
            const foodIdGroup = items[0].food_id;
            const tolerated = items.some((i) => i.tolerated);
            const count = items.length; // días registrados en el rango
            const lastDate = items[items.length - 1].date;
            const nextRec = dayjs(lastDate).add(1, "day").format("DD/MM");
            const outcome = items.find((i) => i.outcome)?.outcome || null;
            const needsOutcome = count === 3 && !outcome && !tolerated;

            let statusBadge = null;
            if (tolerated) {
              statusBadge = (
                <span className="badge text-bg-success chip">Tolerado</span>
              );
            } else if (needsOutcome) {
              statusBadge = (
                <span className="badge text-bg-warning chip">Valorar</span>
              );
            } else {
              statusBadge = (
                <span className="badge text-bg-secondary chip">En prueba</span>
              );
            }

            return (
              <div key={name} className="col-12 col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between">
                      <h5 className="card-title mb-0">{name}</h5>
                      {statusBadge}
                    </div>

                    <div className="mt-2">
                      <div className="text-muted small">
                        Progreso: <strong>{Math.min(count, 3)}/3</strong>
                        {!tolerated && count < 3 && (
                          <>
                            {" "}
                            · Siguiente recomendado:{" "}
                            <strong>{nextRec}</strong>
                          </>
                        )}
                        {outcome && !tolerated && (
                          <> · Resultado: <strong>{outcome}</strong></>
                        )}
                      </div>
                      <div className="d-flex gap-2 flex-wrap mt-2">
                        {items.map((e, idx) => (
                          <span
                            key={e.id}
                            className={`badge ${
                              tolerated
                                ? "text-bg-success"
                                : "text-bg-light"
                            } chip`}
                          >
                            Día {idx + 1}: {dayjs(e.date).format("DD/MM")}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bloque de valoración exactamente al 3er día */}
                    {needsOutcome && (
                      <OutcomeForm
                        onSave={async (value) => {
                          try {
                            // usamos la ruta de outcome; si no existe, comenta esta línea.
                            await nutricionApi.setOutcome({
                              foodId: foodIdGroup,
                              outcome: value, // 'ok' | 'dudoso' | 'malo'
                            });
                            await reload();
                          } catch (e) {
                            console.error(e);
                            alert("No se pudo guardar la valoración.");
                          }
                        }}
                      />
                    )}

                    {/* Si aún no va por 3 y no está tolerado, permite añadir hoy */}
                    {!tolerated && !needsOutcome && (
                      <button
                        className="btn btn-outline-primary w-100 mt-3 pill"
                        onClick={async () => {
                          try {
                            await nutricionApi.addExposure({
                              date: dayjs().format("YYYY-MM-DD"),
                              foodId: foodIdGroup,
                            });
                            await reload();
                          } catch (e) {
                            console.error(e);
                            alert("No se pudo registrar la exposición de hoy.");
                          }
                        }}
                      >
                        Registrar exposición hoy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nota de uso */}
      <p className="text-muted small mt-4">
        El calendario es para marcar lo que ha comido en cada comida.
        Las exposiciones controlan la introducción en 3 días. Al completar el 3º,
        valora cómo le ha sentado; si es “Bien”, queda marcado como tolerado.
      </p>
    </div>
  );
}

/* ===== Componente pequeño para valorar al 3er día ===== */
function OutcomeForm({ onSave }) {
  const [value, setValue] = useState("ok"); // 'ok' | 'dudoso' | 'malo'
  return (
    <div className="mt-3 border rounded p-2">
      <label className="form-label mb-2">¿Cómo le ha sentado?</label>
      <div className="d-flex gap-2 flex-wrap">
        <label className="btn btn-outline-success flex-grow-1">
          <input
            type="radio"
            className="btn-check"
            name="outcome"
            value="ok"
            checked={value === "ok"}
            onChange={() => setValue("ok")}
          />{" "}
          Bien
        </label>
        <label className="btn btn-outline-warning flex-grow-1">
          <input
            type="radio"
            className="btn-check"
            name="outcome"
            value="dudoso"
            checked={value === "dudoso"}
            onChange={() => setValue("dudoso")}
          />{" "}
          Dudoso
        </label>
        <label className="btn btn-outline-danger flex-grow-1">
          <input
            type="radio"
            className="btn-check"
            name="outcome"
            value="malo"
            checked={value === "malo"}
            onChange={() => setValue("malo")}
          />{" "}
          Mala reacción
        </label>
      </div>
      <button className="btn btn-primary w-100 mt-2" onClick={() => onSave(value)}>
        Guardar valoración
      </button>
    </div>
  );
}
