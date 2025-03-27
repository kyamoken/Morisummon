import React from 'react';
import styled from 'styled-components';
import Header from '@/components/Header.tsx';
import useCardManager from '@/hooks/useCardManager';
import useDeckManager from '@/hooks/useDeckManager';
import type { Card } from '@/types/models';
import { toast } from 'react-hot-toast';
import BubblesBackground from '@/components/BubblesBackground';

const Deck: React.FC = () => {
  const { cards } = useCardManager();
  const deckManager = useDeckManager();

  const handleRemoveCardFromDeck = (index: number) => {
    deckManager.removeCardFromDeck(index);
  };

  const handleAddCardToDeck = (card: Card) => {
    deckManager.addCardToDeck(card);
  };

  const handleSaveDeck = () => {
    deckManager
      .saveDeck()
      .then(() => {
        toast.success('デッキが保存されました');
      })
      .catch(async (error) => {
        console.log('Error caught:', error);
        try {
          const errorData = error.response ? await error.response.json() : null;
          console.log('Error Data:', errorData);

          if (errorData?.error === 'duplicate_card') {
            toast.error(errorData.message || '同一カードを複数枚追加することはできません');
          } else {
            toast.error('保存に失敗しました');
          }
        } catch (err) {
          console.error('Unexpected error:', err);
          toast.error('エラーが発生しました');
        }
      });
  };

  return (
    <DeckContainer>
      <BubblesBackground />
      <Header />
      <Content>
        <h1>デッキ編集</h1>
        {deckManager.isLoading ? (
          <p>ロード中...</p>
        ) : (
          <>
            <DeckArea>
              {deckManager.editingDeck.map((card, index) => (
                <CardSlot key={index} onClick={() => handleRemoveCardFromDeck(index)}>
                  {card?.image ? (
                    <CardImage src={card.image} alt={card.name || 'カード画像'} />
                  ) : (
                    <CardName>{card?.name || '未設定'}</CardName>
                  )}
                </CardSlot>
              ))}
            </DeckArea>
            {cards && (
              <ScrollableArea>
                <CardList>
                  {cards.map((item, index) => (
                    <CardItem key={index} onClick={() => handleAddCardToDeck(item.card)}>
                      {item.card.image ? (
                        <CardImage src={item.card.image} alt={item.card.name} />
                      ) : (
                        <CardText>
                          {item.card.name} ({item.amount})
                        </CardText>
                      )}
                    </CardItem>
                  ))}
                </CardList>
              </ScrollableArea>
            )}
            <Button type="button" onClick={handleSaveDeck}>
              デッキを保存
            </Button>
          </>
        )}
      </Content>
    </DeckContainer>
  );
};

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius);
  z-index: 1;
`;

const CardName = styled.div`
  font-size: 14px;
  color: white;
  text-align: center;
`;

const CardText = styled.div`
  font-size: 14px;
  color: blue;
  text-align: center;
  padding: 5px;
  z-index: 2;
`;

const DeckContainer = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  color: white;
  text-align: center;
  overflow: hidden;
  background: linear-gradient(270deg, #383875, #6f6fa8, #383875);
  background-size: 600% 600%;
  animation: gradientAnimation 15s ease infinite;
  padding-top: 120px; /* ヘッダー分のスペース */

  @keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
`;

// デッキエリアのグリッド：大画面は6列、1024px以下で4列、768px以下で3列、480px以下で2列に変更
const DeckArea = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-bottom: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CardSlot = styled.div`
  width: 100px;
  height: 150px;
  background-color: var(--card-background);
  border: 1px solid var(--input-border);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  @media (max-width: 1024px) {
    width: 90px;
    height: 135px;
  }
  @media (max-width: 768px) {
    width: 80px;
    height: 120px;
  }
  @media (max-width: 480px) {
    width: 70px;
    height: 105px;
  }
`;

const ScrollableArea = styled.div`
  width: 90%;
  max-width: 600px;
  overflow-x: auto;
  margin: 0 auto;
  border: 1px solid var(--input-border);
  border-radius: var(--border-radius);
  padding: 10px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const CardList = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: nowrap;
  white-space: nowrap;
`;

const CardItem = styled.div`
  flex: 0 0 auto;
  width: 100px;
  height: 150px;
  background-color: var(--card-background);
  border: 1px solid var(--input-border);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  @media (max-width: 1024px) {
    width: 90px;
    height: 135px;
  }
  @media (max-width: 768px) {
    width: 80px;
    height: 120px;
  }
  @media (max-width: 480px) {
    width: 70px;
    height: 105px;
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

  @media (max-width: 768px) {
    width: 150px;
    font-size: 16px;
  }
  @media (max-width: 480px) {
    width: 120px;
    font-size: 14px;
  }
`;

export default Deck;
