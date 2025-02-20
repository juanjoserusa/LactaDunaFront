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

    useEffect(() => {
        axios.get(`${API_URL}/recordatorios`)
            .then((res) => setRecordatorios(res.data))
            .catch((error) => console.error("❌ Error al cargar recordatorios:", error));
    }, []);

    return (
        <div className="container text-center mt-5">
            <h1 className="fw-bold text-primary">LactaDuna</h1>
            <p className="text-muted">Registro de lactancia y cuidados del bebé</p>

            {/* 🔹 Recordatorios */}
            <div className="card p-3 shadow-sm mt-4">
        <h4 className="fw-bold">
          <span role="img" aria-label="alarma">🔔</span> Recordatorios <span role="img" aria-label="alarma">🔔</span>
        </h4>
        
        <div className="d-flex justify-content-center gap-4 mt-2">
          {/* Baño */}
          <div className="text-center">
            <div className={`circle ${recordatorios?.necesita_baño ? "bg-danger" : "bg-success"}`}></div>
            <p className="fw-bold">Baño</p>
          </div>

          {/* Vitamina D */}
          <div className="text-center">
            <div className={`circle ${recordatorios?.necesita_vitamina_d ? "bg-danger" : "bg-success"}`}></div>
            <p className="fw-bold">Vitamina D</p>
          </div>
        </div>

        {recordatorios?.lactancia_ultima && (
  <div className="mt-3 p-3 lactancia-card">
    <h5 className="fw-bold text-center">🍼 Última lactancia 🍼</h5>
    <hr />
    <div className="d-flex align-items-center">
      <span className="fw-bold">📅 Hora:</span>
      <span className="ms-2">{dayjs.utc(recordatorios.lactancia_ultima.fecha_hora).tz("Europe/Madrid").format("HH:mm")}</span>
    </div>

    {/* Calcular la próxima toma */}
    <div className="d-flex align-items-center">
      <span className="fw-bold text-success">⏰ Próxima toma:</span>
      <span className="ms-2 text-success">
        {dayjs.utc(recordatorios.lactancia_ultima.fecha_hora).tz("Europe/Madrid").add(2, "hour").format("HH:mm")} - 
        {dayjs.utc(recordatorios.lactancia_ultima.fecha_hora).tz("Europe/Madrid").add(3, "hour").format("HH:mm")}
      </span>
    </div>

    {/* Convertir solo la primera palabra a Capitalize */}
    <div className="d-flex align-items-center">
      <span className="fw-bold">🍼 Tipo:</span>
      <span className="ms-2">
        {recordatorios.lactancia_ultima.tipo.charAt(0).toUpperCase() + recordatorios.lactancia_ultima.tipo.slice(1).toLowerCase()}
      </span>
    </div>

    {recordatorios.lactancia_ultima.tipo.includes("pecho") ? (
      <div className="d-flex align-items-center">
        <span className="fw-bold">⏳ Duración:</span>
        <span className="ms-2">{recordatorios.lactancia_ultima.tiempo} min</span>
      </div>
    ) : (
      <div className="d-flex align-items-center">
        <span className="fw-bold">🍼 Cantidad:</span>
        <span className="ms-2">{recordatorios.lactancia_ultima.cantidad} ml</span>
      </div>
    )}
  </div>
)}




      </div>

            {/* 🔹 Próximas citas */}
            {recordatorios.citas_proximas.length > 0 && (
                <div className="card p-3 shadow-sm mt-4">
                    <h4>📅 Próximas Citas 📅</h4>
                    <ul className="list-group">
                        {recordatorios.citas_proximas.map((cita) => (
                            <li key={cita.id} className="list-group-item">
                                {dayjs.utc(cita.fecha_hora).tz("Europe/Madrid").format("DD/MM/YYYY HH:mm")} - {cita.descripcion}
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
                
                <Link to="/banos" className="btn btn-info btn-lg py-3 fw-bold shadow rounded">
                    🛁 Baños
                </Link>
                
                <Link to="/vitamina-d" className="btn btn-warning btn-lg py-3 fw-bold shadow rounded">
                    💊 Vitamina D
                </Link>
                <Link to="/citas" className="btn btn-secondary btn-lg py-3 fw-bold shadow rounded ">
                    📅 Citas
                </Link>
                <Link to="/peso" className="btn btn-danger btn-lg py-3 fw-bold shadow rounded">
                    ⚖️ Peso
                </Link>
                <Link to="/panales" className="btn btn-success btn-lg py-3 fw-bold shadow rounded mb-5">
                    👶 Pañales
                </Link>
            </div>
        </div>
    );
}

export default Home;
