import React, { useState } from 'react';
import styled from 'styled-components';
import Header from '@/components/Header.tsx'; // ヘッダーコンポーネントをインポート

const Deck: React.FC = () => {
  const [deck, setDeck] = useState<string[]>(Array(10).fill(''));
  const [cards, /* setcards */] = useState<string[]>(['カード1', 'カード2', 'カード3', 'カード4', 'カード5']);

  const handleAddCardToDeck = (card: string) => {
    const emptyIndex = deck.indexOf('');
    if (emptyIndex !== -1) {
      const newDeck = [...deck];
      newDeck[emptyIndex] = card;
      setDeck(newDeck);
    }
  };

  const handleRemoveCardFromDeck = (index: number) => {
    const newDeck = [...deck];
    newDeck[index] = '';
    setDeck(newDeck);
  };

  const handleSaveDeck = () => {
    // デッキ保存のロジックを追加
    console.log('デッキ:', deck);
  };

  return (
    <DeckContainer>
      <Header />
      <Content>
        <h1>デッキ編集</h1>
        <DeckArea>
          {deck.map((card, index) => (
            <CardSlot key={index} onClick={() => handleRemoveCardFromDeck(index)}>
              {card || '空'}
            </CardSlot>
          ))}
        </DeckArea>
        <CardList>
          {cards.map((card, index) => (
            <Card key={index} onClick={() => handleAddCardToDeck(card)}>
              {card}
            </Card>
          ))}
        </CardList>
        <Button type="button" onClick={handleSaveDeck}>デッキを保存</Button>
      </Content>
    </DeckContainer>
  );
};

const DeckContainer = styled.div`
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
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 0 auto;
`;

const DeckArea = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
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
`;

const CardList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
`;

const Card = styled.div`
  width: 100px;
  height: 150px;
  background-color: var(--card-background);
  border: 1px solid var(--input-border);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
`;

export default Deck;
