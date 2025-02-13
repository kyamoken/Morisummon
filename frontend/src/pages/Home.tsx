// home.tsx
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import Header from '@/components/Header';
import { FloatingButton, FloatingDangerButton } from '@/components/FloatingButton';
import useAuth from '@/hooks/useAuth';
import BubblesBackground from '@/components/BubblesBackground'; // 新コンポーネントをインポート

const Home: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout('/'); // 明示的にトップページへリダイレクト
  };

  return (
    <HomeContainer>
      <BubblesBackground />
      <Header />

      <Content>
        <h1>Morisummonへようこそ！</h1>
        <ButtonContainer>
          {/* 1行目（2カラム分を結合） */}
          <FloatingButton
            as={Link}
            to="/battle"
            style={{ gridArea: 'matching', width: '100%' }}
          >
            マッチング
          </FloatingButton>

          {/* 2行目 */}
          <FloatingButton
            as={Link}
            to="/deck"
            style={{ gridArea: 'deck', width: '100%' }}
          >
            デッキ
          </FloatingButton>
          <FloatingButton
            as={Link}
            to="/gacha"
            style={{ gridArea: 'gacha', width: '100%' }}
          >
            ガチャ
          </FloatingButton>

          {/* 3行目 */}
          <FloatingButton
            as={Link}
            to="/card-collection"
            style={{ gridArea: 'zukan', width: '100%' }}
          >
            図鑑
          </FloatingButton>
          <FloatingButton
            as={Link}
            to="/friends"
            style={{ gridArea: 'friend', width: '100%' }}
          >
            フレンド
          </FloatingButton>

          {/* 4行目（2カラム分を結合） */}
          <FloatingDangerButton
            onClick={handleLogout}
            style={{ gridArea: 'logout', width: '100%' }}
          >
            ログアウト
          </FloatingDangerButton>
        </ButtonContainer>
      </Content>
    </HomeContainer>
  );
};

export default Home;

/* スタイル定義 */
const HomeContainer = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  color: white;
  text-align: center;
  overflow: hidden;
  background: linear-gradient(270deg, #383875, #6f6fa8, #383875);
  background-size: 600% 600%;
  animation: gradientAnimation 15s ease infinite;

  @keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  margin-top: 90px; /* ヘッダーの高さ分だけ下にずらす */
`;

const ButtonContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto auto auto auto;
  grid-template-areas:
    "matching matching"
    "deck gacha"
    "zukan friend"
    "logout logout";
  gap: 20px;
  max-width: 500px;
  margin: 40px auto;
`;
