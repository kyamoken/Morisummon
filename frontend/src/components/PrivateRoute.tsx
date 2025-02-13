// PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router';
import useAuth from '@/hooks/useAuth';

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user } = useAuth();

  // useSWR の初期値が undefined の場合、認証情報の取得中と判断する
  if (user === undefined) {
    return <div>Loading...</div>;
  }

  // 認証情報が null ならログインしていないので、ログインページへリダイレクト
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 認証済みの場合は、子コンポーネントをそのまま表示
  return children;
};

export default PrivateRoute;
