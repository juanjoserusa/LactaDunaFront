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
          <span role="img" aria-label="alarma">🔔</span> Recordatorios
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

        {/* Última Lactancia */}
        {recordatorios?.lactancia_ultima && (
          <div className="mt-3">
            <h5 className="fw-bold">Última lactancia</h5>
            <p className="mb-0">
              <strong>Hora:</strong> {dayjs.utc(recordatorios.lactancia_ultima.fecha_hora).tz("Europe/Madrid").format("HH:mm")}
            </p>
            <p className="mb-0">
              <strong>Tipo:</strong> {recordatorios.lactancia_ultima.tipo}
            </p>
            {recordatorios.lactancia_ultima.tipo.includes("pecho") ? (
              <p><strong>Duración:</strong> {recordatorios.lactancia_ultima.tiempo} min</p>
            ) : (
              <p><strong>Cantidad:</strong> {recordatorios.lactancia_ultima.cantidad} ml</p>
            )}
          </div>
        )}
      </div>

            {/* 🔹 Próximas citas */}
            {recordatorios.citas_proximas.length > 0 && (
                <div className="card p-3 shadow-sm mt-4">
                    <h4>📅 Citas Próximas</h4>
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
                <Link to="/panales" className="btn btn-success btn-lg py-3 fw-bold shadow rounded">
                    👶 Pañales
                </Link>
                <Link to="/banos" className="btn btn-info btn-lg py-3 fw-bold shadow rounded">
                    🛁 Baños
                </Link>
                <Link to="/vitamina-d" className="btn btn-warning btn-lg py-3 fw-bold shadow rounded">
                    💊 Vitamina D
                </Link>
                <Link to="/peso" className="btn btn-danger btn-lg py-3 fw-bold shadow rounded">
                    ⚖️ Peso
                </Link>
                <Link to="/citas" className="btn btn-secondary btn-lg py-3 fw-bold shadow rounded">
                    📅 Citas
                </Link>
            </div>
        </div>
    );
}

export default Home;
