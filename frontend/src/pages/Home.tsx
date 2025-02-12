// home.tsx
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import Header from '@/components/Header';
import { FloatingButton, FloatingDangerButton } from '@/components/FloatingButton';
import useAuth from '@/hooks/useAuth';

const Home: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // バブル生成
  const bubbles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      arr.push({
        left: Math.random() * 100,
        size: Math.random() * 40 + 10,
        delay: Math.random() * 5,
      });
    }
    return arr;
  }, []);

  return (
    <HomeContainer>
      <BubbleBackground>
        {bubbles.map((bubble, index) => (
          <Bubble
            key={index}
            left={bubble.left}
            size={bubble.size}
            delay={bubble.delay}
          />
        ))}
      </BubbleBackground>

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
        </ButtonContainer>
        <FloatingDangerButton onClick={handleLogout} style={{ width: '200px' }}>
          ログアウト
        </FloatingDangerButton>
      </Content>
    </HomeContainer>
  );
};

export default Home;

/* ----------------------- */
/* Styled Components       */
/* ----------------------- */

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

const BubbleBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
`;

const Bubble = styled.div<{ left: number; size: number; delay: number }>`
  position: absolute;
  bottom: -150px;
  left: ${(props) => props.left}%;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: rise 10s linear infinite;
  animation-delay: ${(props) => props.delay}s;

  @keyframes rise {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-120vh) scale(0.5); opacity: 0; }
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  margin-top: 90px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
`;
