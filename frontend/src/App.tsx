// app.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import styled, { keyframes } from 'styled-components';
import Header from './components/Header';
import useAuth from './hooks/useAuth';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import TermsOfServiceModal from './components/TermsOfServiceModal';
import { FloatingButton } from './components/FloatingButton';
import BubblesBackground from './components/BubblesBackground';
// import BouncingTitle from './components/BouncingTitle';

interface FloatingCard {
  id: number;
  image: string;
  left: number; // %
  top: number;  // %
  cell: { col: number; row: number };
}

function App() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isPrivacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [isTermsOfServiceOpen, setTermsOfServiceOpen] = useState(false);

  // 背景カード用の state
  const [floatingCards, setFloatingCards] = useState<FloatingCard[]>([]);
  const cardIdRef = useRef(0);

  useEffect(() => {
    const cardImages = [
      '/static/images/cards/card01.png',
      '/static/images/cards/card02.png',
      '/static/images/cards/card03.png',
      '/static/images/cards/card04.png',
      '/static/images/cards/card05.png',
      '/static/images/cards/card06.png',
      '/static/images/cards/card07.png',
      '/static/images/cards/card08.png',
      '/static/images/cards/card09.png',
      '/static/images/cards/card10.png',
      '/static/images/cards/card11.png',
      '/static/images/cards/card12.png',
      '/static/images/cards/card13.png',
      '/static/images/cards/card14.png',
      '/static/images/cards/card15.png',
      '/static/images/cards/card16.png',
    ];

    // グリッド設定（4×4 のグリッド）
    const numColumns = 4;
    const numRows = 4;
    const cellWidth = 100 / numColumns; // 各セルの幅（%）
    const cellHeight = 100 / numRows;   // 各セルの高さ（%）

    const intervalId = setInterval(() => {
      setFloatingCards((prevCards) => {
        const id = cardIdRef.current++;

        // 現在占有中のセルを取得
        const occupiedCells = prevCards.map(
          (card) => `${card.cell.col}-${card.cell.row}`
        );

        // 全セルのリストを生成
        const allCells: { col: number; row: number }[] = [];
        for (let col = 0; col < numColumns; col++) {
          for (let row = 0; row < numRows; row++) {
            allCells.push({ col, row });
          }
        }

        // 空いているセルのみ抽出
        const freeCells = allCells.filter(
          (cell) => !occupiedCells.includes(`${cell.col}-${cell.row}`)
        );

        // 空いているセルがあればその中から、なければ全セルからランダムに選択
        const chosenCell =
          freeCells.length > 0
            ? freeCells[Math.floor(Math.random() * freeCells.length)]
            : allCells[Math.floor(Math.random() * allCells.length)];

        // セル内の中央付近に配置するため、セルの中心に対して小さなランダムオフセットを付与
        const offsetX = (Math.random() - 0.5) * (cellWidth / 2);
        const offsetY = (Math.random() - 0.5) * (cellHeight / 2);
        let left = chosenCell.col * cellWidth + cellWidth / 2 + offsetX;
        let top = chosenCell.row * cellHeight + cellHeight / 2 + offsetY;
        left = Math.max(0, Math.min(100, left));
        top = Math.max(0, Math.min(100, top));

        // 配列からランダムにカード画像を選択
        const randomImage =
          cardImages[Math.floor(Math.random() * cardImages.length)];

        const newCard: FloatingCard = {
          id,
          image: randomImage,
          left,
          top,
          cell: chosenCell,
        };

        // カードを5秒後に削除
        setTimeout(() => {
          setFloatingCards((cards) => cards.filter((card) => card.id !== id));
        }, 5000);

        return [...prevCards, newCard];
      });
    }, 1500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <AppContainer>
      {/* 背景のバブルアニメーション */}
      <BubblesBackground />

      {/* 背景のカードアニメーション */}
      <FloatingCardsContainer>
        {floatingCards.map((card) => (
          <FloatingCardStyled
            key={card.id}
            src={card.image}
            left={card.left}
            top={card.top}
          />
        ))}
      </FloatingCardsContainer>

      <Header />

      <Main>
        {/* タイトルとサブタイトル */}
        <TitleSection>
          <TatsuyaImageLeft src="/static/images/green_kuma.png" alt="Tatsuya Left" />
          <AnimatedTitle text="Morisummon" />
          {/* <BouncingTitle text="Morisummon" /> */}
          <Subtitle>某カードゲームにインスパイアされて作りました。</Subtitle>
          <TatsuyaImageRight src="/static/images/red_kuma.png" alt="Tatsuya Right" />
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
              <DeveloperIcon src="/static/images/kyamokenICON.png" alt="Kyamoken Icon" />
              <DeveloperName>Kyamoken</DeveloperName>
            </DeveloperCard>
            <DeveloperCard onClick={() => window.open('https://github.com/kp63', '_blank')}>
              <DeveloperIcon src="/static/images/sawakiLOGO.png" alt="kp63 Icon" />
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
        <p>2025 Developed by Kyamoken</p>
      </Footer>

      <PrivacyPolicyModal isOpen={isPrivacyPolicyOpen} onClose={() => setPrivacyPolicyOpen(false)} />
      <TermsOfServiceModal isOpen={isTermsOfServiceOpen} onClose={() => setTermsOfServiceOpen(false)} />
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

const FloatingCardsContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
`;

const fadeInUpAndOut = keyframes`
  0% { opacity: 0; transform: translateY(0); }
  20% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; transform: translateY(-50px); }
  100% { opacity: 0; transform: translateY(-100px); }
`;

const FloatingCardStyled = styled.img<{ left: number; top: number }>`
  position: absolute;
  left: ${({ left }) => left}%;
  top: ${({ top }) => top}%;
  width: 80px;
  filter: blur(4px);
  animation: ${fadeInUpAndOut} 5s forwards;
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
  flex-wrap: wrap;
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

  &:hover { transform: scale(1.02); }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const DeveloperIcon = styled.img`
  width: 125px;
  height: 125px;
  object-fit: cover;
  border-radius: var(--border-radius);

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
  }
`;

const DeveloperName = styled.p`
  margin: 0;
  color: var(--developer-card-textcolor);
  transition: text-shadow 0.3s ease;

  &:hover { text-shadow: 2px 2px 8px rgba(255, 255, 255, 0.85); }
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

  span:hover { transform: rotate(5deg); }
`;
