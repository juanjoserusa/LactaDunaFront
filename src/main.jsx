import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Lactancia from "./pages/Lactancia";
import VitaminaD from "./pages/VitaminaD";
import React from "react";
import ReactDOM from "react-dom/client";
// import Panales from "./pages/Panales";   // 👈 ocultamos
// import Baños from "./pages/Baños";        // 👈 ocultamos
import Peso from "./pages/Peso";
import Citas from "./pages/Citas";

// NUEVO
import Alimentacion from "./pages/Alimentacion";
import AlimentacionExposiciones from "./pages/AlimentacionExposiciones";
import AlimentacionRecetas from "./pages/AlimentacionRecetas";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lactancia" element={<Lactancia />} />
        {/* <Route path="/panales" element={<Panales />} /> */}
        <Route path="/vitamina-d" element={<VitaminaD />} />
        {/* <Route path="/banos" element={<Baños />} /> */}
        <Route path="/peso" element={<Peso />} />
        <Route path="/citas" element={<Citas/>} />

        {/* NUEVO: Alimentación */}
        <Route path="/alimentacion" element={<Alimentacion />} />
        <Route path="/alimentacion/exposiciones" element={<AlimentacionExposiciones />} />
        <Route path="/alimentacion/recetas" element={<AlimentacionRecetas />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
