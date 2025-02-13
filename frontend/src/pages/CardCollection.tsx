// CardCollection.tsx
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Header from '@/components/Header';
import useCardManager from '@/hooks/useCardManager';
import type { Card } from '@/types/models';
import BubblesBackground from '@/components/BubblesBackground';

const CardCollection: React.FC = () => {
  const { cards, isLoading } = useCardManager();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const handleCardClick = (card: Card): void => {
    setSelectedCard(card);
  };

  const handleCloseModal = (): void => {
    setSelectedCard(null);
  };

  return (
    <CardCollectionContainer>
      <BubblesBackground />
      <Header />
      <Content>
        <Title>カード図鑑</Title>
        <CardGrid>
          {isLoading ? (
            <LoadingWrapper>
              <LoadingSpinner />
            </LoadingWrapper>
          ) : cards?.length ? (
            cards.map(({ card }) => (
              <CardSlot key={card.id} onClick={() => handleCardClick(card)}>
                {card.image ? (
                  <CardImage src={card.image} alt={card.name} />
                ) : (
                  <CardPlaceholder>{card.name}</CardPlaceholder>
                )}
              </CardSlot>
            ))
          ) : (
            <p>カードがありません</p>
          )}
        </CardGrid>
      </Content>
      {selectedCard && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ExpandedCardImage
              src={selectedCard.image || ''}
              alt={selectedCard.name}
            />
            <CloseButton onClick={handleCloseModal}>×</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </CardCollectionContainer>
  );
};

export default CardCollection;

/* スタイル定義 */
const CardCollectionContainer = styled.div`
  position: relative;
  min-height: 100vh;
  background: linear-gradient(270deg, #383875, #6f6fa8, #383875);
  background-size: 600% 600%;
  color: #fff;
  padding: 80px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;

  animation: gradientAnimation 15s ease infinite;

  @keyframes gradientAnimation {
    0% { background-position: 0 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0 50%; }
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 2; /* 背景より前面に表示 */
  width: 100%;
  max-width: 1200px;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 40px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
`;

const CardSlot = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const CardPlaceholder = styled.div`
  padding: 20px;
  text-align: center;
  font-size: 1rem;
  color: #bbb;
`;

/* シンプルなフェードインアニメーション */
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
`;

/* モーダルコンテンツ（黒いボーダーを追加、スクロールバー非表示） */
const ModalContent = styled.div`
  position: relative;
  background: #c0c0c0;
  border: 10px solid #646464;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
  /* スクロールバー非表示用 */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`;

const ExpandedCardImage = styled.img`
  width: 300px;
  height: 450px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
`;

/* CloseButton の位置を内側に変更 */
const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #1d1631;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
  &:hover {
    background: #190b2f;
  }
`;


/* ローディング用スタイル */
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
`;

const LoadingSpinner = styled.div`
  border: 8px solid rgba(255, 255, 255, 0.3);
  border-top: 8px solid #fff;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${rotate} 1s linear infinite;
`;
