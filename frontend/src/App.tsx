// App.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import styled, { keyframes } from 'styled-components';
import Header from './components/Header';
import useAuth from './hooks/useAuth';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import TermsOfServiceModal from './components/TermsOfServiceModal';
import { FloatingButton } from './components/FloatingButton';
import BubblesBackground from './components/BubblesBackground';
import FloatingCardsBackground from './components/FloatingCardsBackground';

function App() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isPrivacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [isTermsOfServiceOpen, setTermsOfServiceOpen] = useState(false);

  return (
    <AppContainer>
      {/* 背景のバブルアニメーション */}
      <BubblesBackground />
      {/* 背景のカードアニメーション（コンポーネント化） */}
      <FloatingCardsBackground />

      <Header />

      <Main>
        {/* タイトルとサブタイトル */}
        <TitleSection>
          <TatsuyaImageLeft src="/static/images/Ball_green.png" alt="Tatsuya Left" />
          <AnimatedTitle text="Morisummon" />
          {/* <BouncingTitle text="Morisummon" /> */}
          <Subtitle>パクリじゃないです。オマージュです。</Subtitle>
          <TatsuyaImageRight src="/static/images/Ball_green.png" alt="Tatsuya Right" />
        </TitleSection>

        <ButtonsContainer>
          {isLoading ? (
            <p>ロード中...</p>
          ) : user ? (
            <FloatingButton onClick={() => navigate('/home')}>
              ホーム
            </FloatingButton>
          ) : (
            <FloatingButton onClick={() => navigate('/login')}>
              ログイン
            </FloatingButton>
          )}
        </ButtonsContainer>

        <DevelopersSection>
          <h2>デベロッパー</h2>
          <DeveloperCards>
            <DeveloperCard onClick={() => window.open('https://github.com/kyamoken', '_blank')}>
              <img src="/static/images/kyamokenICON.png" width="125" height="125" alt="icon" />
              <DeveloperName>Kyamoken</DeveloperName>
            </DeveloperCard>
            <DeveloperCard onClick={() => window.open('https://github.com/kp63', '_blank')}>
              <img src="/static/images/sawakiLOGO.png" width="125" height="125" alt="GitHub" />
              <DeveloperName>kp63</DeveloperName>
            </DeveloperCard>
          </DeveloperCards>
        </DevelopersSection>
      </Main>

      <Footer>
        <p>
          <span onClick={() => setPrivacyPolicyOpen(true)}>プライバシーポリシー</span> |{' '}
          <span onClick={() => setTermsOfServiceOpen(true)}>利用規約</span> | お問い合わせ: kamoken0531@gmail.com
        </p>
        <p>© 2025 ボケモン. Developed by Kyamoken</p>
      </Footer>

      <PrivacyPolicyModal
        isOpen={isPrivacyPolicyOpen}
        onClose={() => setPrivacyPolicyOpen(false)}
      />
      <TermsOfServiceModal
        isOpen={isTermsOfServiceOpen}
        onClose={() => setTermsOfServiceOpen(false)}
      />
    </AppContainer>
  );
}

export default App;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 120vh;
  position: relative;
  background: linear-gradient(270deg, #383875, #6f6fa8, #383875);
  background-size: 600% 600%;
  animation: gradientAnimation 15s ease infinite;
  color: var(--text-color);
  margin: 0;

  @keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const Main = styled.main`
  margin-top: 70px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  position: relative;
  z-index: 1;
`;

const TitleSection = styled.div`
  position: relative;
  text-align: center;
  margin-top: 40px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin: 0;
  color: var(--toppage-title-textcolor, #fff);
`;

const letterAnimation = keyframes`
  0% { transform: translateY(100%); opacity: 0; }
  10% { transform: translateY(0); opacity: 1; }
  90% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
`;

const Letter = styled.span<{ delay: number }>`
  display: inline-block;
  animation: ${letterAnimation} 12s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay}s;
`;

const AnimatedTitle: React.FC<{ text: string }> = ({ text }) => (
  <Title>
    {text.split('').map((char, index) => (
      <Letter key={index} delay={index * 0.2}>
        {char}
      </Letter>
    ))}
  </Title>
);

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--toppage-subtitle-textcolor, #ddd);
  margin: 40px 0 40px;
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const TatsuyaImageRight = styled.img`
  position: absolute;
  top: 5px;
  right: 0;
  width: 40px;
  height: auto;
  animation: ${floatAnimation} 4s ease-in-out infinite;
`;

const TatsuyaImageLeft = styled.img`
  position: absolute;
  top: 5px;
  left: 0;
  width: 40px;
  height: auto;
  animation: ${floatAnimation} 5s ease-in-out infinite;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 30px;
  margin-top: 20px;
`;

const DevelopersSection = styled.section`
  margin-top: 50px;
  text-align: center;
  color: var(--developer-title-color);
  opacity: 0;
  animation: fadeIn 2s forwards;

  @keyframes fadeIn {
    to { opacity: 1; }
  }
`;

const DeveloperCards = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
`;

const DeveloperCard = styled.div`
  background-color: var(--developer-card-backcolor);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.02);
  }

  img {
    border-radius: var(--border-radius);
  }
`;

const DeveloperName = styled.p`
  margin: 0;
  color: var(--developer-card-textcolor);
  transition: text-shadow 0.3s ease;

  &:hover {
    text-shadow: 2px 2px 8px rgba(255, 255, 255, 0.85);
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding: 20px;
  background-color: var(--card-background);
  color: var(--footer-color);
  font-size: 14px;
  margin-top: auto;
  position: relative;
  z-index: 1;

  span {
    cursor: pointer;
    text-decoration: underline;
    transition: transform 0.3s;
  }

  span:hover {
    transform: rotate(5deg);
  }
`;
