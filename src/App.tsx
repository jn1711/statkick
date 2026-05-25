import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import MatchDetail from "./pages/MatchDetail";
import LeagueSimulation from "./pages/LeagueSimulation";
import TransferSimulator from "./pages/TransferSimulator";
import Methodology from "./pages/Methodology";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/match/:id" element={<MatchDetail />} />
      <Route path="/league/:id" element={<LeagueSimulation />} />
      <Route path="/transfer" element={<TransferSimulator />} />
      <Route path="/methodology" element={<Methodology />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
