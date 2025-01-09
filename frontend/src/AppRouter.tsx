import React from 'react';
import { Route, Routes } from 'react-router';
import App from './App';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Page404 from "./pages/404.tsx";
import Matching from "./matching.tsx";
import Battle from "./battle.tsx";
import Home from "./Home.tsx";
import Deck from "./Deck.tsx";
import Setting from "./setting.tsx";

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/deck" element={<Deck />} />
      <Route path="/matching" element={<Matching />} />
      <Route path="/battle" element={<Battle />} />
      <Route path="/settings" element={<Setting />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};

export default AppRouter;
