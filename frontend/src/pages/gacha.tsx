import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import useAuth from '@/hooks/useAuth';
import Header from '@/components/Header.tsx';
import BubblesBackground from '@/components/BubblesBackground';

const availablePacks = ["MorisCardPack", "MonsterPack01"];

const packIcons: { [key: string]: string } = {
  "MorisCardPack": "../static/images/Gacha01.png",
  "MonsterPack01": "../static/images/Gacha02.png"
};

const Gacha: React.FC = () => {
  const { gacha } = useAuth();
  const [result, setResult] = useState<{ name: string; image?: string }[] | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [selectedPack, setSelectedPack] = useState<string>(availablePacks[0]);

  const handlePrevPack = () => {
    const currentIndex = availablePacks.indexOf(selectedPack);
    const prevIndex = (currentIndex - 1 + availablePacks.length) % availablePacks.length;
    setSelectedPack(availablePacks[prevIndex]);
  };

  const handleNextPack = () => {
    const currentIndex = availablePacks.indexOf(selectedPack);
    const nextIndex = (currentIndex + 1) % availablePacks.length;
    setSelectedPack(availablePacks[nextIndex]);
  };

  const handleGacha = async () => {
    if (!selectedPack) {
      alert('引きたいパックを選択してください');
      return;
    }
    setIsAnimating(true);
    const cards = await gacha({ pack: selectedPack });
    setResult(cards);
  };

  const handleClose = () => {
    setResult(null);
    setIsAnimating(false);
  };

  return (
    <GachaContainer>
      <BubblesBackground />
      <Content>
        <Header />
        <h1>ガチャページ</h1>
        <PackSelector>
          <ArrowButton onClick={handlePrevPack}>◀</ArrowButton>
          <PackIcon src={packIcons[selectedPack]} alt={selectedPack} />
          <ArrowButton onClick={handleNextPack}>▶</ArrowButton>
        </PackSelector>
        <Button onClick={handleGacha} disabled={isAnimating || !selectedPack}>
          {isAnimating ? 'ガチャ中...' : 'ガチャを引く'}
        </Button>
        <CostLabel>消費魔法石：10個</CostLabel>
        {!!result && (
          <Modal>
            <CardContainer>
              {result.map((card, index) => (
                <Card key={index} delay={index * 0.3}>
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

export default Gacha;

/* ------------------ Styled Components ------------------ */

const GachaContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  overflow-y: auto;
  width: 100%;
  background: linear-gradient(270deg, #383875, #6f6fa8, #383875);
  background-size: 600% 600%;
  animation: gradientAnimation 15s ease infinite;
  color: white;
  text-align: center;

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

const Content = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const PackSelector = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const ArrowButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0 10px;
  transition: color 0.2s;

  &:hover {
    color: var(--button-hover);
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
    padding: 0 5px;
  }
`;

const PackIcon = styled.img`
  width: 250px;
  height: 250px;
  object-fit: contain;
  border-radius: 10px;

  @media (max-width: 768px) {
    width: 150px;
    height: 150px;
  }
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

const CostLabel = styled.div`
  font-size: 0.8rem;
  color: #ccc;
  margin-top: 5px;
`;

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

const cardPop = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8) rotate(-5deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.05) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
`;

const CardContainer = styled.div`
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
  opacity: 0;
  animation: ${cardPop} 0.8s ease-out forwards;
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
