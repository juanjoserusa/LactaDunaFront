import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const API_URL = import.meta.env.VITE_API_URL;

function Home() {
  const [recordatorios, setRecordatorios] = useState({
    necesita_baño: false,
    necesita_vitamina_d: false,
    lactancia_ultima: null,
    citas_proximas: [],
  });

  // Opcional: exposiciones que tocan hoy (día 2 o 3, o “valorar”)
  const [exposHoy, setExposHoy] = useState([]);
  // Para refrescar reloj/elapsed sin pedir a la API constantemente
  const [, forceTick] = useState(0);

  const tz = "Europe/Madrid";

  const load = async () => {
    try {
      const res = await axios.get(`${API_URL}/recordatorios`);
      setRecordatorios(res.data);
    } catch (error) {
      console.error("❌ Error al cargar recordatorios:", error);
    }

    // Si en el futuro expones algo tipo /exposiciones/hoy, lo intentamos.
    // Si no existe, no pasa nada: no mostramos el bloque.
    try {
      const ex = await axios.get(`${API_URL}/exposiciones/hoy`);
      if (Array.isArray(ex.data)) setExposHoy(ex.data);
    } catch {
      setExposHoy([]); // silencioso
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Tick cada 60s para recalcular “hace X minutos” y la barra
  useEffect(() => {
    const id = setInterval(() => forceTick((x) => x + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // Utilidades de tiempo
  const lastFeed = recordatorios?.lactancia_ultima;
  const lastFeedLocal = lastFeed
    ? dayjs.utc(lastFeed.fecha_hora).tz(tz)
    : null;

  const now = dayjs().tz(tz);
  const elapsedMin = lastFeedLocal ? Math.max(0, now.diff(lastFeedLocal, "minute")) : 0;
  const elapsedStr = (() => {
    if (!lastFeedLocal) return "—";
    const h = Math.floor(elapsedMin / 60);
    const m = elapsedMin % 60;
    return `${h}h ${m.toString().padStart(2, "0")}m`;
  })();

  // Progreso hacia 4h (máx 100%)
  const pct4h = Math.min(100, Math.round((elapsedMin / 240) * 100));

  // Próximas horas sugeridas
  const next3h = lastFeedLocal ? lastFeedLocal.add(3, "hour").format("HH:mm") : "—";
  const next4h = lastFeedLocal ? lastFeedLocal.add(4, "hour").format("HH:mm") : "—";

  const tipoCap = lastFeed?.tipo
    ? lastFeed.tipo.charAt(0).toUpperCase() + lastFeed.tipo.slice(1).toLowerCase()
    : "";

  return (
    <div className="container text-center mt-5">
      <style>{`
        .circle { width:14px; height:14px; border-radius:50%; display:inline-block; }
        .lactancia-card { background:#fafbfd; border:1px solid #e9edf3; border-radius:12px; }
        .progress { height:10px; }
        .kpi { border:1px solid #e9ecef; border-radius:12px; padding:.75rem; }
        .btn-expos{ background:#1f9d7a; color:#fff; border:0; }
        .btn-expos:hover{ filter:brightness(0.95); color:#fff; }
        .btn-recetas{ background:#5b6bff; color:#fff; border:0; }
        .btn-recetas:hover{ filter:brightness(0.95); color:#fff; }
      `}</style>

      <h1 className="fw-bold text-primary">MyBabyTime</h1>
      <p className="text-muted">Registro de lactancia y cuidados del bebé</p>

      {/* 🔹 Recordatorios mejorados */}
      <div className="card p-3 shadow-sm mt-4 text-start">
        <div className="d-flex align-items-center justify-content-between">
          <h4 className="fw-bold m-0">
            <span role="img" aria-label="alarma">🔔</span> Recordatorios
          </h4>
          <button className="btn btn-sm btn-outline-secondary" onClick={load}>↻ Actualizar</button>
        </div>

        {/* Status pills arriba */}
        <div className="d-flex flex-wrap gap-3 mt-3 justify-content-center justify-content-sm-start">
          {/* Vitamina D */}
          <div className="kpi text-center">
            <div className="mb-1">
              <span className={`circle ${recordatorios?.necesita_vitamina_d ? "bg-danger" : "bg-success"}`}></span>
              <span className="ms-2 fw-bold">Vitamina D</span>
            </div>
            <div className={`badge ${recordatorios?.necesita_vitamina_d ? "text-bg-danger" : "text-bg-success"}`}>
              {recordatorios?.necesita_vitamina_d ? "Pendiente hoy" : "Hecha hoy"}
            </div>
            <div className="mt-2">
              <Link to="/vitamina-d" className="btn btn-sm btn-warning">Ir a Vitamina D</Link>
            </div>
          </div>

          {/* (Opcional) Baño — si lo reactivas */}
          {/* <div className="kpi text-center">
            <div className="mb-1">
              <span className={\`circle \${recordatorios?.necesita_baño ? "bg-danger" : "bg-success"}\`}></span>
              <span className="ms-2 fw-bold">Baño</span>
            </div>
            <div className={\`badge \${recordatorios?.necesita_baño ? "text-bg-danger" : "text-bg-success"}\`}>
              {recordatorios?.necesita_baño ? "Toca hoy" : "Al día"}
            </div>
          </div> */}
        </div>

        {/* Última lactancia: hora, transcurrido, próximas */}
        {lastFeedLocal && (
          <div className="mt-3 p-3 lactancia-card">
            <h5 className="fw-bold text-center">🍼 Última lactancia</h5>
            <hr />
            <div className="row g-2 align-items-center">
              <div className="col-12 col-sm-4 d-flex align-items-center">
                <span className="fw-bold">📅 Hora:</span>
                <span className="ms-2">{lastFeedLocal.format("HH:mm")}</span>
              </div>
              <div className="col-12 col-sm-4 d-flex align-items-center">
                <span className="fw-bold">⏳ Hace:</span>
                <span className="ms-2">{elapsedStr}</span>
              </div>
              <div className="col-12 col-sm-4 d-flex align-items-center">
                <span className="fw-bold">🍼 Tipo:</span>
                <span className="ms-2">{tipoCap}</span>
              </div>

              {/* Duración o Cantidad */}
              {recordatorios.lactancia_ultima.tipo?.includes("pecho") ? (
                <div className="col-12 col-sm-4 d-flex align-items-center">
                  <span className="fw-bold">⏱️ Duración:</span>
                  <span className="ms-2">{recordatorios.lactancia_ultima.tiempo} min.</span>
                </div>
              ) : (
                <div className="col-12 col-sm-4 d-flex align-items-center">
                  <span className="fw-bold">🍼 Cantidad:</span>
                  <span className="ms-2">{recordatorios.lactancia_ultima.cantidad} ml.</span>
                </div>
              )}

              {/* Próximas tomas sugeridas */}
              <div className="col-12 col-sm-8 d-flex align-items-center">
                <span className="fw-bold me-2 text-success">⏰ Próxima toma:</span>
                <div className="d-flex flex-wrap gap-3">
                  <div>
                    <span className="text-warning me-2">3h</span>
                    <span className="fw-bold">{next3h}</span>
                  </div>
                  <div>
                    <span className="text-danger me-2">4h</span>
                    <span className="fw-bold">{next4h}</span>
                  </div>
                </div>
              </div>

              {/* Progreso hasta 4h */}
              <div className="col-12 mt-2">
                <div className="small text-muted mb-1">Progreso hacia 4h</div>
                <div className="progress" role="progressbar" aria-valuenow={pct4h} aria-valuemin="0" aria-valuemax="100">
                  <div className="progress-bar" style={{ width: `${pct4h}%` }}>{pct4h}%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exposiciones que tocan hoy (solo si hay datos) */}
        {exposHoy.length > 0 && (
          <div className="mt-3 p-3" style={{ border: "1px solid #eee", borderRadius: 12 }}>
            <h6 className="fw-bold mb-2">✅ Exposiciones de hoy</h6>
            <div className="d-flex flex-wrap gap-2">
              {exposHoy.map((e) => (
                <span key={`${e.food_id}-${e.date}`} className="badge text-bg-light">
                  {e.food_name} · {e.step_label ?? e.step ?? "día?"}
                </span>
              ))}
            </div>
            <div className="mt-2">
              <Link to="/alimentacion/exposiciones" className="btn btn-sm btn-expos">Abrir exposiciones</Link>
            </div>
          </div>
        )}
      </div>

      {/* 🔹 Próximas citas */}
      {recordatorios.citas_proximas.length > 0 && (
        <div className="card p-3 shadow-sm mt-4 text-start">
          <h4 className="m-0">📅 Próximas Citas</h4>
          <ul className="list-group mt-2">
            {recordatorios.citas_proximas.map((cita) => (
              <li key={cita.id} className="list-group-item">
                {dayjs.utc(cita.fecha_hora).tz(tz).format("DD/MM/YYYY HH:mm")} — {cita.descripcion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 🔹 Botones de navegación */}
      <div className="d-flex flex-column gap-4 mt-5">
        <Link to="/lactancia" className="btn btn-primary btn-lg py-3 fw-bold shadow rounded">
          🍼 Lactancia
        </Link>

        <Link to="/alimentacion" className="btn btn-success btn-lg py-3 fw-bold shadow rounded">
          🥣 Alimentación Complementaria
        </Link>

        <Link to="/alimentacion/exposiciones" className="btn btn-expos btn-lg py-3 fw-bold shadow rounded">
          ✅ Exposiciones alérgenos
        </Link>

        <Link to="/alimentacion/recetas" className="btn btn-recetas btn-lg py-3 fw-bold shadow rounded">
          📖 Recetas
        </Link>

        <Link to="/vitamina-d" className="btn btn-warning btn-lg py-3 fw-bold shadow rounded">
          💊 Vitamina D
        </Link>

        <Link to="/citas" className="btn btn-secondary btn-lg py-3 fw-bold shadow rounded">
          📅 Citas
        </Link>

        <Link to="/peso" className="btn btn-danger btn-lg py-3 fw-bold shadow rounded mb-5">
          ⚖️ Peso
        </Link>
      </div>
    </div>
  );
}

export default Home;
