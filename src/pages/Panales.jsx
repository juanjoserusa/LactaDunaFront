import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Link } from "react-router-dom";

dayjs.extend(utc);
dayjs.extend(timezone);

const API_URL = import.meta.env.VITE_API_URL;

function Panales() {
  const [registros, setRegistros] = useState([]);
  const [tipo, setTipo] = useState("");
  const [editando, setEditando] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/panales`).then((res) => setRegistros(res.data));
  }, []);

  const agregarRegistro = async () => {
    try {
      const nuevaFecha = dayjs().utc().format(); // Guardar en UTC

      const datos = { tipo, fecha_hora: nuevaFecha };

      await axios.post(`${API_URL}/panales`, datos, {
        headers: { "Content-Type": "application/json" },
      });

      const res = await axios.get(`${API_URL}/panales`);
      setRegistros(res.data);

      setTipo("");
    } catch (error) {
      console.error("❌ Error al agregar pañal:", error);
      alert("Hubo un error al registrar el pañal.");
    }
  };

  const eliminarRegistro = async (id) => {
    try {
      await axios.delete(`${API_URL}/panales/${id}`);
      setRegistros(registros.filter((item) => item.id !== id));
    } catch (error) {
      console.error("❌ Error al eliminar registro:", error);
      alert("Hubo un error al eliminar el registro.");
    }
  };

  const abrirModalEdicion = (registro) => {
    setEditando({
      ...registro,
      fecha_hora: dayjs.utc(registro.fecha_hora).tz("Europe/Madrid").format("YYYY-MM-DDTHH:mm"), // Formato para datetime-local
    });
    setShowModal(true);
  };

  const actualizarRegistro = async () => {
    try {
      await axios.put(`${API_URL}/panales/${editando.id}`, {
        tipo: editando.tipo,
        fecha_hora: dayjs(editando.fecha_hora).utc().format(),
      });

      const res = await axios.get(`${API_URL}/panales`);
      setRegistros(res.data);
      setShowModal(false);
    } catch (error) {
      console.error("❌ Error al actualizar pañales:", error);
      alert("Hubo un error al actualizar el registro.");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Registro de Pañales</h2>

      <div className="card p-3 shadow-sm mt-4">
        <h4>Nuevo Registro</h4>
        <div className="mb-2">
          <label className="form-label">Tipo de Pañal</label>
          <select
            className="form-control"
            onChange={(e) => setTipo(e.target.value)}
            value={tipo}
          >
            <option value="">Selecciona el tipo</option>
            <option value="pipí">Pipí</option>
            <option value="caca">Caca</option>
          </select>
        </div>

        <button className="btn btn-primary mt-2" onClick={agregarRegistro}>
          Agregar Registro
        </button>
      </div>

      <div className="mt-3 text-center">
        <Link to="/" className="btn btn-secondary">
          ⬅ Volver a Home
        </Link>
      </div>

      <div className="mt-4">
        <h3>Histórico</h3>
        {Object.entries(
          registros.reduce((acc, item) => {
            const fecha =
              item.fecha_hora.split("T")[0] || item.fecha_hora.split(" ")[0];
            acc[fecha] = acc[fecha] || [];
            acc[fecha].push(item);
            return acc;
          }, {})
        ).map(([fecha, items]) => (
          <div key={fecha} className="accordion mb-2" id={`accordion-${fecha}`}>
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button"
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
                        <th>Tipo</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td>{dayjs.utc(item.fecha_hora).tz("Europe/Madrid").format("HH:mm")}</td>
                          <td>{item.tipo}</td>
                          <td>
                            <div className="d-flex justify-content-center gap-2">
                              <button className="btn btn-warning btn-sm" onClick={() => abrirModalEdicion(item)}>
                                ✏️
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => eliminarRegistro(item.id)}>
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

      {showModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3">
              <h4 className="text-center">Editar Registro</h4>
              <label className="form-label mt-2">Tipo</label>
              <select
                className="form-control"
                value={editando.tipo}
                onChange={(e) => setEditando({ ...editando, tipo: e.target.value })}
              >
                <option value="pipí">Pipí</option>
                <option value="caca">Caca</option>
              </select>

              <label className="form-label mt-2">Fecha y Hora</label>
              <input
                type="datetime-local"
                className="form-control"
                value={editando.fecha_hora}
                onChange={(e) => setEditando({ ...editando, fecha_hora: e.target.value })}
              />

              <div className="d-flex justify-content-between mt-3">
                <button className="btn btn-success" onClick={actualizarRegistro}>
                  Guardar
                </button>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Panales;
