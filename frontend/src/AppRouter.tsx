import React from 'react';
import { Route, Routes } from 'react-router';
import App from './App';
import Login from './pages/Login';
import Register from './pages/Register';
import Page404 from "./pages/404";
import Matching from "./pages/Matching";
import Battle from "./pages/Battle";
import Home from "./pages/Home";
import Deck from "./pages/Deck";
import Setting from "./pages/Settings";
import Gacha from "./pages/gacha";
import Cards from './pages/Cards';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/cards" element={<Cards />} />
      <Route path="/deck" element={<Deck />} />
      <Route path="/matching" element={<Matching />} />
      <Route path="/gacha" element={<Gacha />} />
      <Route path="/battle" element={<Battle />} />
      <Route path="/settings" element={<Setting />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};

export default AppRouter;
