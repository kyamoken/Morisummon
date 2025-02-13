import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router';
import App from './App';
import Login from './pages/Login';
import Register from './pages/Register';
import Page404 from "./pages/404";
import Battle from "./pages/Battle";
import Home from "./pages/Home";
import Deck from "./pages/Deck";
import Setting from "./pages/Settings";
import Gacha from "./pages/gacha";
import Cards from './pages/Cards';
import CardCollection from "@/pages/CardCollection.tsx";
import Demo from './pages/Demo';
import Friends from './pages/friend';
import ExchangePage from './pages/ExchangePage';

// 認証してないときにログインページに飛ぶ用のコンポーネントコンポーネント
import PrivateRoute from '@/components/PrivateRoute';

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
      <Route path="/cards" element={<PrivateRoute><Cards /></PrivateRoute>} />
      <Route path="/deck" element={<PrivateRoute><Deck /></PrivateRoute>} />
      <Route path="/gacha" element={<PrivateRoute><Gacha /></PrivateRoute>} />
      <Route path="/card-collection" element={<PrivateRoute><CardCollection /></PrivateRoute>} />
      <Route path="/battle" element={<PrivateRoute><Battle /></PrivateRoute>} />
      <Route path="/friends" element={<PrivateRoute><Friends /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Setting /></PrivateRoute>} />
      <Route path="/exchange/:exchange_ulid" element={<PrivateRoute><ExchangePage /></PrivateRoute>} />
      <Route path="/demo" element={<Demo />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};

export default AppRouter;
