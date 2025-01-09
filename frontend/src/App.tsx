import { useNavigate } from 'react-router';
import styled from 'styled-components';
import './GlobalStyle.css';
import Header from './components/Header.tsx';

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
  cursor: pointer; /* カーソルをポインターに変更 */
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
`;

function App() {
  const navigate = useNavigate();

  const handleCardClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <AppContainer>
      <Header /> {/* ヘッダーを追加 */}

      {/* Main Content */}
      <Main>
        <ButtonsContainer>
          <MainButton onClick={() => navigate('/login')}>
            ログイン
          </MainButton>
          <MainButton onClick={() => navigate('/home')}>
            デバッグ
          </MainButton>
        </ButtonsContainer>

        <DevelopersSection>
          <h2>デベロッパー</h2>
          <DeveloperCards>
            <DeveloperCard onClick={() => handleCardClick('https://github.com/kyamoken')}>
              <img src="/static/images/kyamokenICON.png" width="125" height="125" alt="icon"/>
              <DeveloperName>Kyamoken</DeveloperName>
            </DeveloperCard>
            <DeveloperCard onClick={() => handleCardClick('https://github.com/kp63')}>
              <img src="/static/images/sawakiLOGO.png" alt="GitHub" width="125" height="125" />
              <DeveloperName>kp63</DeveloperName>
            </DeveloperCard>
          </DeveloperCards>
        </DevelopersSection>
      </Main>

      {/* Footer */}
      <Footer>
        <p>プライバシーポリシー | 利用規約 | お問い合わせ: kamoken0531@gmail.com</p>
        <p>© 2025 ボケモン. Developed by Kyamoken</p>
      </Footer>
    </AppContainer>
  );
}

export default App;
