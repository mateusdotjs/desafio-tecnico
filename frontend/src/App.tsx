import { BrowserRouter, Route, Routes } from "react-router";
import AppLayout from "./components/layout/AppLayout.tsx";
import AppointmentPage from "./pages/AppointmentPage.tsx";
import HomePage from "./pages/HomePage.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/agendar" element={<AppointmentPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
