import React, {useEffect} from 'react';
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
import CardCollection from "@/pages/CardCollection.tsx";
import Demo from './pages/Demo';

const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
};

const AppRouter: React.FC = () => {
  useEffect(() => {
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

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
      <Route path="/card-collection" element={<CardCollection />} />
      <Route path="/battle" element={<Battle />} />
      <Route path="/settings" element={<Setting />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};

export default AppRouter;
