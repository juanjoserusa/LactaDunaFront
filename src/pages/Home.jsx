import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="container text-center mt-5">
            <h1 className="fw-bold text-primary">LactaDuna</h1>
            <p className="text-muted">Registro de lactancia y cuidados del bebé</p>
            
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
            </div>
        </div>
    );
}

export default Home;
