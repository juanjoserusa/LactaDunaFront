import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Link } from "react-router-dom";

dayjs.extend(utc);
dayjs.extend(timezone);

const API_URL = import.meta.env.VITE_API_URL;

function Peso() {
  const [registros, setRegistros] = useState([]);
  const [peso, setPeso] = useState("");
  const [editando, setEditando] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/peso_bebe`).then((res) => setRegistros(res.data));
  }, []);

  const agregarRegistro = async () => {
    try {
      const nuevaFecha = dayjs().utc().format(); // Guardar en UTC

      const datos = { fecha: nuevaFecha, peso: parseFloat(peso).toFixed(3) };

      await axios.post(`${API_URL}/peso_bebe`, datos, {
        headers: { "Content-Type": "application/json" },
      });

      const res = await axios.get(`${API_URL}/peso_bebe`);
      setRegistros(res.data);

      setPeso("");
    } catch (error) {
      console.error("❌ Error al agregar peso:", error);
      alert("Hubo un error al registrar el peso.");
    }
  };

  const eliminarRegistro = async (id) => {
    try {
      await axios.delete(`${API_URL}/peso_bebe/${id}`);
      setRegistros(registros.filter((item) => item.id !== id));
    } catch (error) {
      console.error("❌ Error al eliminar peso:", error);
      alert("Hubo un error al eliminar el registro.");
    }
  };

  const abrirModalEdicion = (registro) => {
    setEditando({
      ...registro,
      fecha: dayjs.utc(registro.fecha).format("YYYY-MM-DDTHH:mm"), // Formato correcto para input datetime-local
      peso: registro.peso,
    });
    setShowModal(true);
};

const actualizarRegistro = async () => {
  try {
      const fechaLocal = dayjs(editando.fecha).format("YYYY-MM-DD HH:mm:ss"); // ✅ Convertir a formato correcto

      await axios.put(`${API_URL}/peso_bebe/${editando.id}`, {
          fecha: fechaLocal,
          peso: parseFloat(editando.peso).toFixed(3),
      });

      const res = await axios.get(`${API_URL}/peso_bebe`);
      setRegistros(res.data);
      setShowModal(false);
  } catch (error) {
      console.error("❌ Error al actualizar peso:", error);
      alert("Hubo un error al actualizar el registro.");
  }
};



  return (
    <div className="container mt-4">
      <h2 className="text-center">Registro de Peso del Bebé</h2>

      <div className="card p-3 shadow-sm mt-4">
        <h4>Nuevo Registro</h4>
        <div className="mb-2">
          <label className="form-label">Peso (kg)</label>
          <input
            type="number"
            className="form-control"
            placeholder="Ejemplo: 2.780"
            step="0.001"
            onChange={(e) => setPeso(e.target.value)}
            value={peso}
          />
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
              item.fecha.split("T")[0] || item.fecha.split(" ")[0];
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
                        <th>Peso (kg)</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td>{dayjs.utc(item.fecha).tz("Europe/Madrid").format("HH:mm")}</td>
                          <td>{parseFloat(item.peso).toFixed(3)} kg</td>
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
              <label className="form-label mt-2">Fecha y Hora</label>
              <input
                type="datetime-local"
                className="form-control"
                value={editando.fecha}
                onChange={(e) => setEditando({ ...editando, fecha: e.target.value })}
              />
              <label className="form-label mt-2">Peso (kg)</label>
              <input
                type="number"
                className="form-control"
                step="0.001"
                value={editando.peso}
                onChange={(e) => setEditando({ ...editando, peso: e.target.value })}
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

export default Peso;
