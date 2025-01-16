import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import useAuth from '@/hooks/useAuth';
import Header from '@/components/Header.tsx';

const Gacha: React.FC = () => {
  const { gacha } = useAuth();
  const [result, setResult] = useState<{ name: string; image?: string }[] | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const handleGacha = async () => {
    setIsAnimating(true);
    const cards = await gacha();
    setResult(cards);
  };

  const handleClose = () => {
    setResult(null);
    setIsAnimating(false); // モーダルを閉じる際にリセット
  };

  return (
    <GachaContainer>
      <Header />
      <Content>
        <h1>ガチャページ</h1>
        <Banner src="../static/images/kyamokenICON.png" alt="Banner" />
        <Button onClick={handleGacha} disabled={isAnimating}>
          {isAnimating ? 'ガチャ中...' : "ガチャを引く"}
        </Button>
        {isAnimating && !result && <Animation />}
        {result && (
          <Modal>
            <CardContainer>
              {result.map((card, index) => (
                <Card key={index} delay={index * 0.5}>
                  {card.image ? (
                    <CardImage src={card.image} alt={card.name} />
                  ) : (
                    <CardText>{card.name}</CardText>
                  )}
                </Card>
              ))}
            </CardContainer>
            <CloseButton onClick={handleClose}>もどる</CloseButton>
          </Modal>
        )}
      </Content>
    </GachaContainer>
  );
};

const GachaContainer = styled.div`
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Banner = styled.img`
  width: 200px;
  height: 200px;
  margin: 20px 0;
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 12px 30px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  width: 200px;
  margin-top: 20px;

  &:hover {
    background-color: var(--button-hover);
    transform: scale(1.05);
  }

  &:disabled {
    background-color: gray;
    cursor: not-allowed;
  }
`;

// const spin = keyframes`
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// `;
//
// // const Animation = styled.div`
// //   margin-top: 20px;
// //   width: 50px;
// //   height: 50px;
// //   border: 5px solid var(--primary-color);
// //   border-top: 5px solid white;
// //   border-radius: 50%;
// //   animation: ${spin} 1s linear infinite;
// // `;

const Modal = styled.div`
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 600px;
  position: fixed;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const CardContainer = styled.div`
  animation: ${fadeIn} 0.5s ease-in-out;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;
const Card = styled.div<{ delay: number }>`
  width: 100px;
  height: 150px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  opacity: 0; /* 初期値として非表示に設定 */
  animation: ${fadeIn} 0.5s ease-in-out forwards;
  animation-delay: ${({ delay }) => delay}s;
`;



const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CardText = styled.div`
  font-size: 14px;
  color: black;
  text-align: center;
  padding: 5px;
`;

const CloseButton = styled.button`
  margin-top: 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--button-hover);
  }
`;

export default Gacha;
