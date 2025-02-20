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
  const [tipo, setTipo] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [editando, setEditando] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/lactancia`).then((res) => setRegistros(res.data));
  }, []);

  const agregarRegistro = async () => {
    try {
      const nuevaFecha = dayjs().utc().format();

      const datos = {
        tipo,
        tiempo: tipo.includes("pecho") && tiempo.trim() !== "" ? parseInt(tiempo) : null,
        cantidad: (tipo.includes("materna") || tipo.includes("fórmula")) && cantidad.trim() !== "" ? parseInt(cantidad) : null,
        fecha_hora: nuevaFecha,
      };

      await axios.post(`${API_URL}/lactancia`, datos, {
        headers: { "Content-Type": "application/json" },
      });

      const res = await axios.get(`${API_URL}/lactancia`);
      setRegistros(res.data);

      setTipo("");
      setCantidad("");
      setTiempo("");
    } catch (error) {
      console.error("❌ Error al agregar lactancia:", error);
      alert("Hubo un error al registrar la lactancia.");
    }
  };

  const eliminarRegistro = async (id) => {
    try {
      await axios.delete(`${API_URL}/lactancia/${id}`);
      setRegistros(registros.filter((item) => item.id !== id));
    } catch (error) {
      console.error("❌ Error al eliminar registro:", error);
      alert("Hubo un error al eliminar el registro.");
    }
  };

  const abrirModalEdicion = (registro) => {
    setEditando({
      ...registro,
      tiempo: registro.tiempo ? registro.tiempo.seconds || registro.tiempo : "",
      cantidad: registro.cantidad || "",
      fecha_hora: dayjs.utc(registro.fecha_hora).tz("Europe/Madrid").format("YYYY-MM-DDTHH:mm"),
    });
    setShowModal(true);
  };

  const actualizarRegistro = async () => {
    try {
      await axios.put(`${API_URL}/lactancia/${editando.id}`, {
        tipo: editando.tipo,
        tiempo: editando.tiempo ? parseInt(editando.tiempo) : null,
        cantidad: editando.cantidad ? parseInt(editando.cantidad) : null,
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

  return (
    <div className="container mt-4">
      <h2 className="text-center">Registro de Lactancia</h2>

      <div className="card p-3 shadow-sm mt-4">
        <h4>Nuevo Registro</h4>
        <div className="mb-2">
          <label className="form-label">Tipo de Lactancia</label>
          <select className="form-control" onChange={(e) => setTipo(e.target.value)} value={tipo}>
            <option value="">Selecciona el tipo</option>
            <option value="pecho izquierdo">Pecho Izquierdo</option>
            <option value="pecho derecho">Pecho Derecho</option>
            <option value="leche materna externa">Leche Materna Externa</option>
            <option value="leche de fórmula">Leche de Fórmula</option>
          </select>
        </div>

        {tipo.includes("pecho") && (
          <div className="mb-2">
            <label className="form-label">Tiempo (minutos)</label>
            <input type="number" className="form-control" placeholder="Ejemplo: 15" onChange={(e) => setTiempo(e.target.value)} value={tiempo} />
          </div>
        )}

        {(tipo.includes("materna") || tipo.includes("fórmula")) && (
          <div className="mb-2">
            <label className="form-label">Cantidad (ml)</label>
            <input type="number" className="form-control" placeholder="Ejemplo: 120" onChange={(e) => setCantidad(e.target.value)} value={cantidad} />
          </div>
        )}

        <button className="btn btn-primary mt-2" onClick={agregarRegistro}>Agregar Registro</button>
      </div>

      <div className="mt-3 text-center">
        <Link to="/" className="btn btn-secondary">⬅ Volver a Home</Link>
      </div>

      <div className="mt-4">
        <h3>Histórico</h3>
        {Object.entries(
          registros.reduce((acc, item) => {
            const fecha = item.fecha_hora.split("T")[0] || item.fecha_hora.split(" ")[0];
            acc[fecha] = acc[fecha] || [];
            acc[fecha].push(item);
            return acc;
          }, {})
        ).map(([fecha, items]) => (
          <div key={fecha} className="accordion mb-2" id={`accordion-${fecha}`}>
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${fecha}`} aria-expanded="false" aria-controls={`collapse-${fecha}`}>
                  {fecha}
                </button>
              </h2>
              <div id={`collapse-${fecha}`} className="accordion-collapse collapse" data-bs-parent={`#accordion-${fecha}`}>
                <div className="accordion-body">
                  <table className="table table-striped text-center">
                    <thead className="table-light">
                      <tr>
                        <th>Hora</th>
                        <th>Tipo</th>
                        <th>Tiempo / Cantidad</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td>{dayjs.utc(item.fecha_hora).tz("Europe/Madrid").format("HH:mm")}</td>
                          <td>{item.tipo}</td>
                          <td>{item.cantidad ? `${item.cantidad} ml` : `${item.tiempo?.seconds || item.tiempo || 0} min`}</td>
                          <td>
                            <div className="d-flex justify-content-end">
                              <button className="btn btn-warning btn-sm me-2" onClick={() => abrirModalEdicion(item)}>✏️</button>
                              <button className="btn btn-danger btn-sm" onClick={() => eliminarRegistro(item.id)}>🗑️</button>
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

      {showModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3">
              <h4>Editar Registro</h4>
              <label className="form-label mt-2">Tipo</label>
              <select className="form-control" value={editando.tipo} onChange={(e) => setEditando({ ...editando, tipo: e.target.value })}>
                <option value="pecho izquierdo">Pecho Izquierdo</option>
                <option value="pecho derecho">Pecho Derecho</option>
                <option value="leche materna externa">Leche Materna Externa</option>
                <option value="leche de fórmula">Leche de Fórmula</option>
              </select>

              <label className="form-label mt-2">Fecha y Hora</label>
              <input type="datetime-local" className="form-control" value={editando.fecha_hora} onChange={(e) => setEditando({ ...editando, fecha_hora: e.target.value })} />

              {editando.tipo.includes("pecho") && (
                <input type="number" className="form-control mt-2" placeholder="Tiempo (min)" value={editando.tiempo} onChange={(e) => setEditando({ ...editando, tiempo: e.target.value })} />
              )}
              {(editando.tipo.includes("materna") || editando.tipo.includes("fórmula")) && (
                <input type="number" className="form-control mt-2" placeholder="Cantidad (ml)" value={editando.cantidad} onChange={(e) => setEditando({ ...editando, cantidad: e.target.value })} />
              )}
              

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