// App.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
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

  return (
    <AppContainer>
      <Header /> {/* ヘッダー */}

      {/* Main Content */}
      <Main>
        <ButtonsContainer>
          {isLoading ? (
            <p>ロード中...</p>
          ) : user ? (
            <MainButton
              onClick={() => {
                playSoundEffect(BUTTON_CLICK_SE_URL);
                navigate('/home');
              }}
            >
              ホーム
            </MainButton>
          ) : (
            <MainButton
              onClick={() => {
                playSoundEffect(BUTTON_CLICK_SE_URL);
                navigate('/login');
              }}
            >
              ログイン
            </MainButton>
          )}
        </ButtonsContainer>

        <DevelopersSection>
          <h2>デベロッパー</h2>
          <DeveloperCards>
            <DeveloperCard
              onClick={() =>
                handleCardClick('https://github.com/kyamoken')
              }
            >
              <img
                src="/static/images/kyamokenICON.png"
                width="125"
                height="125"
                alt="icon"
              />
              <DeveloperName>Kyamoken</DeveloperName>
            </DeveloperCard>
            <DeveloperCard
              onClick={() =>
                handleCardClick('https://github.com/kp63')
              }
            >
              <img
                src="/static/images/sawakiLOGO.png"
                alt="GitHub"
                width="125"
                height="125"
              />
              <DeveloperName>kp63</DeveloperName>
            </DeveloperCard>
          </DeveloperCards>
        </DevelopersSection>
      </Main>

      {/* Footer */}
      <Footer>
        <p>
          <span onClick={() => setPrivacyPolicyOpen(true)}>
            プライバシーポリシー
          </span>{' '}
          |{' '}
          <span onClick={() => setTermsOfServiceOpen(true)}>
            利用規約
          </span>{' '}
          | お問い合わせ: kamoken0531@gmail.com
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

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 120vh;
  background-color: var(--background-color);
  color: var(--text-color);
  margin: 0;
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
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 30px;
  margin-top: 100px;
`;

const MainButton = styled.button`
  padding: 15px 40px;
  font-size: 20px;
  border: none;
  border-radius: var(--border-radius);
  background-color: var(--primary-color);
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: var(--button-hover);
    transform: scale(1.1);
  }
`;

const DevelopersSection = styled.section`
  margin-top: 50px;
  text-align: center;
  color: var(--developer-title-color);
`;

const DeveloperCards = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
`;

const DeveloperCard = styled.div`
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  img {
    border-radius: var(--border-radius);
  }
`;

const DeveloperName = styled.p`
  margin: 0;
  color: var(--text-color);
`;

const Footer = styled.footer`
  text-align: center;
  padding: 20px;
  background-color: var(--card-background);
  color: var(--text-color);
  font-size: 14px;
  margin-top: auto;

  span {
    cursor: pointer;
    text-decoration: underline;
  }
`;

export default App;
