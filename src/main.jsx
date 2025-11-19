import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import QuotationGenerator from "./App";
import QuotationDashboard from "./dashboard";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<QuotationGenerator />} />
        <Route path="/dashboard" element={<QuotationDashboard />} />
      </Routes>
    </Router>
  </StrictMode>
);
