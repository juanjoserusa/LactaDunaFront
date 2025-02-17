import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Banos() {
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/banos`).then((res) => setRegistros(res.data));
  }, []);

  const agregarRegistro = async () => {
    try {
      const nuevaFecha = dayjs().format("YYYY-MM-DD HH:mm:ss");

      const datos = { fecha_hora: nuevaFecha };

      await axios.post(`${API_URL}/banos`, datos, {
        headers: { "Content-Type": "application/json" },
      });

      const res = await axios.get(`${API_URL}/banos`);
      setRegistros(res.data);
    } catch (error) {
      console.error("❌ Error al agregar baño:", error);
      alert("Hubo un error al registrar el baño.");
    }
  };

  const eliminarRegistro = async (id) => {
    try {
      await axios.delete(`${API_URL}/banos/${id}`);
      setRegistros(registros.filter((item) => item.id !== id));
    } catch (error) {
      console.error("❌ Error al eliminar baño:", error);
      alert("Hubo un error al eliminar el registro.");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Registro de Baños</h2>

      <div className="card p-3 shadow-sm mt-4">
        <h4>Nuevo Registro</h4>
        <button className="btn btn-primary mt-2" onClick={agregarRegistro}>
          Registrar Baño
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
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td>{dayjs(item.fecha_hora).format("HH:mm")}</td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => eliminarRegistro(item.id)}
                            >
                              🗑️
                            </button>
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
    </div>
  );
}

export default Banos;
