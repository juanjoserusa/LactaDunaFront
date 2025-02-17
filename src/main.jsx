import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Lactancia from "./pages/Lactancia";
import Panales from "./pages/Panales";
import VitaminaD from "./pages/VitaminaD";
import React from "react";
import ReactDOM from "react-dom/client";
import Baños from "./pages/Baños";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/lactancia" element={<Lactancia />} />
                <Route path="/panales" element={<Panales />} />
                <Route path="/vitamina-d" element={<VitaminaD />} />
                <Route path="/banos" element={<Baños />} />
            </Routes>
        </Router>
    </React.StrictMode>
);
