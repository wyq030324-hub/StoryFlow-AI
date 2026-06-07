import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Characters from "../pages/Characters.jsx";
import Comparison from "../pages/Comparison.jsx";
import Home from "../pages/Home.jsx";
import ReviewReport from "../pages/ReviewReport.jsx";
import Rewrite from "../pages/Rewrite.jsx";
import SchemaDoc from "../pages/SchemaDoc.jsx";
import Studio from "../pages/Studio.jsx";

function AppRoutes() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    setIsVisible(false);
    const frame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname]);

  return (
    <div
      key={location.pathname}
      className={`transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/workspace" element={<Studio />} />
        <Route path="/characters" element={<Characters />} />
        <Route path="/rewrite" element={<Rewrite />} />
        <Route path="/comparison" element={<Comparison />} />
        <Route path="/review" element={<ReviewReport />} />
        <Route path="/schema" element={<SchemaDoc />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default AppRoutes;
