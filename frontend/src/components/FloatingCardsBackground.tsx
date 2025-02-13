// FloatingCardsBackground.tsx
import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

interface FloatingCard {
  id: number;
  image: string;
  left: number; // %
  top: number;  // %
  cell: { col: number; row: number };
}

const FloatingCardsBackground: React.FC = () => {
  const [floatingCards, setFloatingCards] = useState<FloatingCard[]>([]);
  const cardIdRef = useRef(0);

  useEffect(() => {
    // 使用するカード画像（card01.png～card07.png）
    const cardImages = [
      '/static/images/cards/card01.png',
      '/static/images/cards/card02.png',
      '/static/images/cards/card03.png',
      '/static/images/cards/card04.png',
      '/static/images/cards/card05.png',
      '/static/images/cards/card06.png',
      '/static/images/cards/card07.png',
    ];

    // グリッド設定（4×4）
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

        // セル内の中央付近に配置するため、小さなランダムオフセットを付与
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

        // 5秒後にカードを削除
        setTimeout(() => {
          setFloatingCards((cards) => cards.filter((card) => card.id !== id));
        }, 5000);

        return [...prevCards, newCard];
      });
    }, 1500);

    return () => clearInterval(intervalId);
  }, []);

  return (
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
  );
};

export default FloatingCardsBackground;

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
