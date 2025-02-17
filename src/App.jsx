import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://tu-api.railway.app"; // Usa la URL de Railway

function App() {
    const [lactancia, setLactancia] = useState([]);
    const [tipo, setTipo] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [tiempo, setTiempo] = useState("");

    useEffect(() => {
        axios.get(`${API_URL}/lactancia`).then((res) => setLactancia(res.data));
    }, []);

    const agregarLactancia = async () => {
        await axios.post(`${API_URL}/lactancia`, { tipo, cantidad, tiempo });
        const res = await axios.get(`${API_URL}/lactancia`);
        setLactancia(res.data);
    };

    return (
        <div className="container">
            <h1 className="mt-4">Registro de Lactancia</h1>
            <select className="form-control" onChange={(e) => setTipo(e.target.value)}>
                <option value="">Selecciona el tipo</option>
                <option value="pecho izquierdo">Pecho Izquierdo</option>
                <option value="pecho derecho">Pecho Derecho</option>
                <option value="leche materna externa">Leche Materna Externa</option>
                <option value="leche de fórmula">Leche de Fórmula</option>
            </select>
            {tipo.includes("pecho") && (
                <input
                    type="text"
                    className="form-control mt-2"
                    placeholder="Tiempo (en minutos)"
                    onChange={(e) => setTiempo(e.target.value)}
                />
            )}
            {(tipo.includes("materna") || tipo.includes("fórmula")) && (
                <input
                    type="number"
                    className="form-control mt-2"
                    placeholder="Cantidad (ml)"
                    onChange={(e) => setCantidad(e.target.value)}
                />
            )}
            <button className="btn btn-primary mt-2" onClick={agregarLactancia}>
                Agregar Registro
            </button>
            <ul className="list-group mt-4">
                {lactancia.map((item) => (
                    <li className="list-group-item" key={item.id}>
                        {item.fecha_hora} - {item.tipo} - {item.cantidad ? `${item.cantidad} ml` : `${item.tiempo} min`}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
