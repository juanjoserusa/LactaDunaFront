import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Link } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Estilos del calendario
import "../index.css"; // Asegurar que los estilos están aplicados

dayjs.extend(utc);
dayjs.extend(timezone);

const API_URL = import.meta.env.VITE_API_URL;

function Citas() {
  const [citas, setCitas] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [horaSeleccionada, setHoraSeleccionada] = useState("12:00");
  const [descripcion, setDescripcion] = useState("");
  const [editando, setEditando] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Cargar citas al iniciar
  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      const res = await axios.get(`${API_URL}/citas_bebe`);
      setCitas(res.data);
    } catch (error) {
      console.error("❌ Error cargando citas:", error);
      alert("Hubo un error al obtener las citas.");
    }
  };

  // Verificar si un día tiene citas
  const tieneCitas = (date) => {
    return citas.some((cita) => dayjs.utc(cita.fecha_hora).tz("Europe/Madrid").isSame(date, "day"));
  };

  const agregarCita = async () => {
    try {
      if (!descripcion.trim()) {
        alert("La descripción no puede estar vacía.");
        return;
      }

      const fechaCompleta = dayjs(fechaSeleccionada)
        .set("hour", parseInt(horaSeleccionada.split(":")[0]))
        .set("minute", parseInt(horaSeleccionada.split(":")[1]))
        .utc()
        .format("YYYY-MM-DD HH:mm:ss");

      const datos = { fecha_hora: fechaCompleta, descripcion };

      await axios.post(`${API_URL}/citas_bebe`, datos, {
        headers: { "Content-Type": "application/json" },
      });

      setDescripcion("");
      setHoraSeleccionada("12:00");
      cargarCitas();
    } catch (error) {
      console.error("❌ Error al agregar cita:", error);
      alert("Hubo un error al registrar la cita.");
    }
  };

  const eliminarCita = async (id) => {
    try {
      await axios.delete(`${API_URL}/citas_bebe/${id}`);
      cargarCitas();
    } catch (error) {
      console.error("❌ Error al eliminar cita:", error);
      alert("Hubo un error al eliminar la cita.");
    }
  };

  const abrirModalEdicion = (cita) => {
    setEditando({
      ...cita,
      fecha_hora: dayjs.utc(cita.fecha_hora).tz("Europe/Madrid").format("YYYY-MM-DDTHH:mm"),
    });
    setShowModal(true);
  };

  const actualizarCita = async () => {
    try {
      await axios.put(`${API_URL}/citas_bebe/${editando.id}`, {
        fecha_hora: dayjs(editando.fecha_hora).utc().format("YYYY-MM-DD HH:mm:ss"),
        descripcion: editando.descripcion,
      });

      setShowModal(false);
      cargarCitas();
    } catch (error) {
      console.error("❌ Error al actualizar cita:", error);
      alert("Hubo un error al actualizar la cita.");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Citas del Bebé</h2>

      <div className="card p-3 shadow-sm mt-4">
        <h4>Agregar Cita</h4>
        <div className="mb-2">
          <label className="form-label">Seleccionar Fecha</label>
          <Calendar
            onChange={setFechaSeleccionada}
            value={fechaSeleccionada}
            tileClassName={({ date }) => (tieneCitas(date) ? "cita-marcada" : null)}
          />
        </div>

        <div className="mb-2">
          <label className="form-label">Seleccionar Hora</label>
          <input
            type="time"
            className="form-control"
            value={horaSeleccionada}
            onChange={(e) => setHoraSeleccionada(e.target.value)}
          />
        </div>

        <div className="mb-2">
          <label className="form-label">Descripción</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ejemplo: Visita al pediatra"
            onChange={(e) => setDescripcion(e.target.value)}
            value={descripcion}
          />
        </div>

        <button className="btn btn-primary mt-2" onClick={agregarCita}>
          Agregar Cita
        </button>
      </div>

      <div className="mt-3 text-center">
        <Link to="/" className="btn btn-secondary">
          ⬅ Volver a Home
        </Link>
      </div>

      <div className="mt-4">
        <h3>Histórico de Citas</h3>
        <ul className="list-group">
          {citas.length === 0 ? (
            <p className="text-center text-muted">No hay citas registradas.</p>
          ) : (
            citas.map((item) => (
              <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{dayjs.utc(item.fecha_hora).tz("Europe/Madrid").format("DD/MM/YYYY HH:mm")}</strong> - {item.descripcion}
                </div>
                <div>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => abrirModalEdicion(item)}>
                    ✏️
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => eliminarCita(item.id)}>
                    🗑️
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {showModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h4>Editar Cita</h4>
              <label className="form-label mt-2">Fecha y Hora</label>
              <input
                type="datetime-local"
                className="form-control"
                value={editando.fecha_hora}
                onChange={(e) => setEditando({ ...editando, fecha_hora: e.target.value })}
              />
              <label className="form-label mt-2">Descripción</label>
              <input
                type="text"
                className="form-control"
                value={editando.descripcion}
                onChange={(e) => setEditando({ ...editando, descripcion: e.target.value })}
              />
              <button className="btn btn-success mt-3" onClick={actualizarCita}>
                Guardar
              </button>
              <button className="btn btn-secondary mt-2" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Citas;
