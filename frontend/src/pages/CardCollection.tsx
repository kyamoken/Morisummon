import React, { useState } from 'react';
import styled from 'styled-components';
import Header from '@/components/Header';
import useCardManager from '@/hooks/useCardManager';
import type { Card } from '@/types/models';

const CardCollection: React.FC = () => {
  const { cards } = useCardManager(); // 所持カードを取得
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  return (
    <CardCollectionContainer>
      <Header />
      <Content>
        <h1>カード図鑑</h1>
        <CardGrid>
          {cards?.length ? (
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

      {!!selectedCard && (
        <ModalCard onClick={handleCloseModal}>
          <ExpandedCardImage
            src={selectedCard.image || ''}
            alt={selectedCard.name}
          />
        </ModalCard>
      )}
    </CardCollectionContainer>
  );
};

const CardCollectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color);
  color: white;
  min-height: 100vh;
  padding-top: 120px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
`;

const CardGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding: 20px;
`;

const CardSlot = styled.div`
  width: 120px;
  height: 180px;
  background-color: var(--card-background);
  border: 1px solid var(--input-border);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius);
`;

const CardPlaceholder = styled.div`
  font-size: 14px;
  color: gray;
  text-align: center;
  padding: 10px;
`;

const ModalCard = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
`;

const ExpandedCardImage = styled.img`
  width: 300px;
  height: 450px;
  object-fit: cover;
  border-radius: var(--border-radius);
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.05);
  }
`;

export default CardCollection;
