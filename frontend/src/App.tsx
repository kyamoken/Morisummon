import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import styled, { keyframes } from 'styled-components';
import Header from './components/Header.tsx';
import useAuth from './hooks/useAuth.tsx';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import TermsOfServiceModal from './components/TermsOfServiceModal';
import useSoundEffect from './hooks/useSoundEffect';

function App() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isPrivacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [isTermsOfServiceOpen, setTermsOfServiceOpen] = useState(false);
  const BUTTON_CLICK_SE_URL = '/static/sounds/Click_button.mp3';
  const playSoundEffect = useSoundEffect();

  const handleCardClick = (url: string) => {
    playSoundEffect(BUTTON_CLICK_SE_URL);
    window.open(url, '_blank');
  };

  // バブルの設定（ランダムな位置・大きさ・開始遅延）
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
    <AppContainer>
      {/* 背景の泡アニメーション */}
      <BubbleBackground>
        {bubbles.map((bubble, index) => (
          <Bubble key={index} left={bubble.left} size={bubble.size} delay={bubble.delay} />
        ))}
      </BubbleBackground>

      <Header />

      <Main>
        {/* タイトルとサブタイトル */}
        <TitleSection>
          <TatsuyaImageLeft src="/static/images/jus_hover.png" alt="Tatsuya Left" />
          <Title>Morisummon</Title>
          <Subtitle>パクリじゃないです。オマージュです。</Subtitle>
          <TatsuyaImageRight src="/static/images/title_tatsuya.png" alt="Tatsuya Right" />
        </TitleSection>

        <ButtonsContainer>
          {isLoading ? (
            <p>ロード中...</p>
          ) : user ? (
            <RippleButton
              onClick={() => {
                playSoundEffect(BUTTON_CLICK_SE_URL);
                navigate('/home');
              }}
            >
              ホーム
            </RippleButton>
          ) : (
            <RippleButton
              onClick={() => {
                playSoundEffect(BUTTON_CLICK_SE_URL);
                navigate('/login');
              }}
            >
              ログイン
            </RippleButton>
          )}
        </ButtonsContainer>

        <DevelopersSection>
          <h2>デベロッパー</h2>
          <DeveloperCards>
            <DeveloperCard onClick={() => handleCardClick('https://github.com/kyamoken')}>
              <img src="/static/images/kyamokenICON.png" width="125" height="125" alt="icon" />
              <DeveloperName>Kyamoken</DeveloperName>
            </DeveloperCard>
            <DeveloperCard onClick={() => handleCardClick('https://github.com/kp63')}>
              <img src="/static/images/sawakiLOGO.png" alt="GitHub" width="125" height="125" />
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

      <PrivacyPolicyModal isOpen={isPrivacyPolicyOpen} onClose={() => setPrivacyPolicyOpen(false)} />
      <TermsOfServiceModal isOpen={isTermsOfServiceOpen} onClose={() => setTermsOfServiceOpen(false)} />
    </AppContainer>
  );
}

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
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

/* 背景の泡アニメーション */
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
    0% {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translateY(-120vh) scale(0.5);
      opacity: 0;
    }
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
  z-index: 1; /* バブルより上に表示 */
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

const Subtitle = styled.p`
  font-size: 1rem;
  color: var(--toppage-subtitle-textcolor, #ddd);
  margin: 10px 0 40px;
`;

const floatAnimation = keyframes`
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
`;

const TatsuyaImageRight = styled.img`
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: auto;
  animation: ${floatAnimation} 5s ease-in-out infinite;
`;

const TatsuyaImageLeft = styled.img`
  position: absolute;
  top: 0;
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

const BaseButton = styled.button`
  padding: 15px 40px;
  font-size: 20px;
  border: none;
  border-radius: var(--border-radius);
  background-color: var(--primary-color);
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: var(--button-hover);
    transform: scale(1.1);
  }

  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;

const RippleButton: React.FC<{
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}> = ({ onClick, children }) => {
  const [ripples, setRipples] = useState<
    { x: number; y: number; size: number; key: number }[]
  >([]);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(button.clientWidth, button.clientHeight);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const newRipple = { x, y, size, key: Date.now() };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.key !== newRipple.key));
    }, 600);
  };

  return (
    <BaseButton
      onClick={(e) => {
        createRipple(e);
        onClick && onClick(e);
      }}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.key}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            width: ripple.size,
            height: ripple.size,
            top: ripple.y,
            left: ripple.x,
            pointerEvents: 'none',
            transform: 'scale(0)',
            animation: 'ripple 0.6s linear',
          }}
        />
      ))}
    </BaseButton>
  );
};

const DevelopersSection = styled.section`
  margin-top: 50px;
  text-align: center;
  color: var(--developer-title-color);
  opacity: 0;
  animation: fadeIn 2s forwards;
  animation-delay: 1s;

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
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
  position: relative;

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

export default App;
