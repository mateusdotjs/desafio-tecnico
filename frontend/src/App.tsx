import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import AppLayout from "./components/layout/AppLayout.tsx";
import AppointmentPage from "./pages/AppointmentPage.tsx";
import DebugPage from "./pages/DebugPage.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/agendar" replace />} />
          <Route path="/agendar" element={<AppointmentPage />} />
          <Route path="/debug" element={<DebugPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
