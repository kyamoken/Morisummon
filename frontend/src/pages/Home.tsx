// home.tsx
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import Header from '@/components/Header.tsx';
import { FloatingButton, FloatingDangerButton } from '@/components/FloatingButton'; // FloatingButtonとFloatingDangerButtonをインポート
import useAuth from '@/hooks/useAuth.tsx';

const Home: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <HomeContainer>
      <Header />
      <Content>
        <h1>エッジワースカードへようこそ！</h1>
        <ButtonContainer>
          <FloatingButton as={Link} to="/battle" style={{ width: '200px' }}>
            マッチング
          </FloatingButton>
          <FloatingButton as={Link} to="/deck" style={{ width: '200px' }}>
            デッキ
          </FloatingButton>
          <FloatingButton as={Link} to="/gacha" style={{ width: '200px' }}>
            ガチャ
          </FloatingButton>
          <FloatingButton as={Link} to="/card-collection" style={{ width: '200px' }}>
            図鑑
          </FloatingButton>
          <FloatingButton as={Link} to="/friends" style={{ width: '200px' }}>
            フレンド
          </FloatingButton>
          <FloatingButton as={Link} to="/settings" style={{ width: '200px' }}>
            設定
          </FloatingButton>
        </ButtonContainer>
        {/* ログアウトボタンはFloatingDangerButtonを利用して、色は赤のままに */}
        <FloatingDangerButton onClick={handleLogout} style={{ width: '200px' }}>
          ログアウト
        </FloatingDangerButton>
      </Content>
    </HomeContainer>
  );
};

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: var(--background-color);
  color: white;
  width: 100%;
  text-align: center;
`;

const Content = styled.div`
  text-align: center;
  margin: 0 auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
`;

export default Home;
