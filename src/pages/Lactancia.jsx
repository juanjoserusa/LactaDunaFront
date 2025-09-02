import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Link } from "react-router-dom";

dayjs.extend(utc);
dayjs.extend(timezone);

const API_URL = import.meta.env.VITE_API_URL;

function Lactancia() {
  const [registros, setRegistros] = useState([]);
  const [cantidad, setCantidad] = useState("");
  const [editando, setEditando] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Carga inicial
  useEffect(() => {
    axios.get(`${API_URL}/lactancia`).then((res) => setRegistros(res.data));
  }, []);

  // Crear (solo fórmula)
  const agregarRegistro = async () => {
    try {
      const cantidadNum = parseInt(cantidad, 10);
      if (Number.isNaN(cantidadNum) || cantidadNum <= 0) {
        alert("Introduce una cantidad válida (ml).");
        return;
      }

      const nuevaFecha = dayjs().utc().format();
      const datos = {
        tipo: "leche de fórmula", // fijo
        tiempo: null,             // compatibilidad
        cantidad: cantidadNum,
        fecha_hora: nuevaFecha,
      };

      await axios.post(`${API_URL}/lactancia`, datos, {
        headers: { "Content-Type": "application/json" },
      });

      const res = await axios.get(`${API_URL}/lactancia`);
      setRegistros(res.data);
      setCantidad("");
    } catch (error) {
      console.error("❌ Error al agregar lactancia:", error);
      alert("Hubo un error al registrar la toma.");
    }
  };

  // Eliminar
  const eliminarRegistro = async (id) => {
    try {
      await axios.delete(`${API_URL}/lactancia/${id}`);
      setRegistros((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("❌ Error al eliminar registro:", error);
      alert("Hubo un error al eliminar el registro.");
    }
  };

  // Abrir modal de edición
  const abrirModalEdicion = (registro) => {
    setEditando({
      ...registro,
      // cantidad puede venir como número o string
      cantidad: registro.cantidad ?? "",
      // normalizamos a local para el input datetime-local
      fecha_hora: dayjs.utc(registro.fecha_hora).tz("Europe/Madrid").format("YYYY-MM-DDTHH:mm"),
    });
    setShowModal(true);
  };

  // Guardar edición
  const actualizarRegistro = async () => {
    try {
      const cantidadNum = parseInt(editando.cantidad, 10);
      if (Number.isNaN(cantidadNum) || cantidadNum <= 0) {
        alert("Introduce una cantidad válida (ml).");
        return;
      }

      await axios.put(`${API_URL}/lactancia/${editando.id}`, {
        tipo: "leche de fórmula", // fijo
        tiempo: null,             // compatibilidad
        cantidad: cantidadNum,
        fecha_hora: dayjs(editando.fecha_hora).utc().format(),
      });

      const res = await axios.get(`${API_URL}/lactancia`);
      setRegistros(res.data);
      setShowModal(false);
    } catch (error) {
      console.error("❌ Error al actualizar lactancia:", error);
      alert("Hubo un error al actualizar el registro.");
    }
  };

  // Agrupar por día (YYYY-MM-DD)
  const registrosPorFecha = Object.entries(
    registros.reduce((acc, item) => {
      const fecha = (item.fecha_hora || "").split("T")[0] || (item.fecha_hora || "").split(" ")[0];
      if (!fecha) return acc;
      acc[fecha] = acc[fecha] || [];
      acc[fecha].push(item);
      return acc;
    }, {})
  ).sort(([a], [b]) => (a > b ? -1 : 1)); // últimos días primero

  return (
    <div className="container mt-4">
      <h2 className="text-center">Registro de Lactancia</h2>

      {/* NUEVO REGISTRO (solo fórmula) */}
      <div className="card p-3 shadow-sm mt-4">
        <h4>Nueva Toma (Fórmula)</h4>
        <div className="mb-2">
          <label className="form-label">Cantidad (ml)</label>
          <input
            type="number"
            className="form-control"
            placeholder="Ejemplo: 120"
            min={1}
            onChange={(e) => setCantidad(e.target.value)}
            value={cantidad}
          />
          <small className="text-muted">Introduce la cantidad en mililitros.</small>
        </div>

        <button
          className="btn btn-primary mt-2"
          onClick={agregarRegistro}
          disabled={!cantidad || parseInt(cantidad, 10) <= 0}
        >
          Agregar Registro
        </button>
      </div>

      <div className="mt-3 text-center">
        <Link to="/" className="btn btn-secondary">⬅ Volver a Home</Link>
      </div>

      {/* HISTÓRICO */}
      <div className="mt-4">
        <h3>Histórico</h3>

        {registrosPorFecha.length === 0 && (
          <p className="text-muted">Aún no hay registros.</p>
        )}

        {registrosPorFecha.map(([fecha, items]) => (
          <div key={fecha} className="accordion mb-2" id={`accordion-${fecha}`}>
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse-${fecha}`}
                  aria-expanded="false"
                  aria-controls={`collapse-${fecha}`}
                >
                  {fecha}
                </button>
              </h2>
              <div
                id={`collapse-${fecha}`}
                className="accordion-collapse collapse"
                data-bs-parent={`#accordion-${fecha}`}
              >
                <div className="accordion-body">
                  <table className="table table-striped text-center">
                    <thead className="table-light">
                      <tr>
                        <th>Hora</th>
                        <th>Cantidad</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items
                        .sort((a, b) => (a.fecha_hora > b.fecha_hora ? -1 : 1)) // más recientes primero
                        .map((item) => (
                        <tr key={item.id}>
                          <td>{dayjs.utc(item.fecha_hora).tz("Europe/Madrid").format("HH:mm")}</td>
                          <td>{(item.cantidad ?? 0) + " ml"}</td>
                          <td>
                            <div className="d-flex justify-content-end">
                              <button
                                className="btn btn-warning btn-sm me-2"
                                onClick={() => abrirModalEdicion(item)}
                              >
                                ✏️
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => eliminarRegistro(item.id)}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDICIÓN */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3">
              <h4>Editar Toma (Fórmula)</h4>

              <label className="form-label mt-2">Fecha y Hora</label>
              <input
                type="datetime-local"
                className="form-control"
                value={editando.fecha_hora}
                onChange={(e) => setEditando({ ...editando, fecha_hora: e.target.value })}
              />

              <label className="form-label mt-2">Cantidad (ml)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Cantidad (ml)"
                min={1}
                value={editando.cantidad}
                onChange={(e) => setEditando({ ...editando, cantidad: e.target.value })}
              />

              <button className="btn btn-success mt-3" onClick={actualizarRegistro}>Guardar</button>
              <button className="btn btn-secondary mt-2" onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Lactancia;
