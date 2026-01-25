import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import RequestPage from "./Pages/RequestPage";
import Dashboard from "./Pages/Dashboard";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/request/demo-cafe" />} />
        <Route path="/request/:cafeId" element={<RequestPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Layout>
  );
}
