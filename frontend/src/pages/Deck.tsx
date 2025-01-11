import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from '@/components/Header.tsx'; // ヘッダーコンポーネントをインポート

const Deck: React.FC = () => {
  const [deck, setDeck] = useState<string[]>(Array(10).fill(''));
  const [cards, setCards] = useState<{ name: string, amount: number }[]>([]);

  useEffect(() => {
    // ユーザーのカードをバックエンドから取得
    fetch('/api/user-cards')
      .then(response => response.json())
      .then(data => {
        // 所持数が1以上のカードのみをフィルタリング
        const filteredCards = data.filter((card: { name: string, amount: number }) => card.amount > 0);
        setCards(filteredCards);
      })
      .catch(error => console.error('Error fetching cards:', error));
  }, []);

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
        <ScrollableArea>
          <CardList>
            {cards.map((card, index) => (
              <Card key={index} onClick={() => handleAddCardToDeck(card.name)}>
                {card.name} ({card.amount})
              </Card>
            ))}
          </CardList>
        </ScrollableArea>
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
  padding-top: 120px; /* ヘッダーのスペースを確保 */
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

const ScrollableArea = styled.div`
  width: 90%; /* 横スクロールエリアの幅を画面サイズに調整 */
  max-width: 600px; /* 最大幅を設定 */
  overflow-x: auto; /* 横スクロールを許可 */
  margin: 0 auto; /* 中央寄せ */
  border: 1px solid var(--input-border);
  border-radius: var(--border-radius);
  padding: 10px; /* 内側の余白 */
  box-sizing: border-box;
`;

const CardList = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: nowrap; /* 横方向に並べる */
  white-space: nowrap; /* 改行を防止 */
`;

const Card = styled.div`
  flex: 0 0 auto; /* 横スクロール用に幅を固定 */
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
