import React from 'react';
import styled from 'styled-components';
import Header from '@/components/Header.tsx';
import useCardManager from '@/hooks/useCardManager';

const Cards: React.FC = () => {
  const { cards, error } = useCardManager();

  if (error) {
    return (
      <DeckContainer>
        <Header />
        <Content>
          <h1>所有カード</h1>
          <p style={{ color: "#db6464" }}>カード情報の取得に失敗しました</p>
        </Content>
      </DeckContainer>
    );
  }

  return (
    <DeckContainer>
      <Header />
      <Content>
        <h1>所有カード</h1>
        <DeckArea>
          {!cards ? (
            <p>ロード中...</p>
          ) : cards.map((item, index) => (
            <CardSlot key={index}>
              {item.card.name} ({item.amount})
            </CardSlot>
          ))}
        </DeckArea>
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

export default Cards;
