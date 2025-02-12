// BouncingTitle.tsx
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

interface LetterType {
  id: number;
  char: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  width: number;
  height: number;
}

const BouncingTitle: React.FC<{ text: string }> = ({ text }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [letters, setLetters] = useState<LetterType[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const letterSize = 40; // 各文字の幅・高さ（目安）

  // マウント時にコンテナサイズを取得し、各文字の初期位置・速度をランダムに設定
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
      const initialLetters: LetterType[] = text.split('').map((char, index) => ({
        id: index,
        char,
        width: letterSize,
        height: letterSize,
        x: Math.random() * (rect.width - letterSize),
        y: Math.random() * (rect.height - letterSize),
        // 速度はランダム（単位はピクセル/ミリ秒 ※調整用に0.1乗算しています）
        dx: (Math.random() * 100 - 50) / 50,
        dy: (Math.random() * 100 - 50) / 50,
      }));
      setLetters(initialLetters);
    }
  }, [text]);

  // アニメーションループ
  useEffect(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return;
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      setLetters(prevLetters => {
        const updated = prevLetters.map(letter => ({ ...letter }));
        // 位置更新＆画面端との衝突処理
        for (let i = 0; i < updated.length; i++) {
          const letter = updated[i];
          letter.x += letter.dx * deltaTime * 0.1;
          letter.y += letter.dy * deltaTime * 0.1;

          // 画面左端・右端
          if (letter.x < 0) {
            letter.x = 0;
            letter.dx = -letter.dx;
          }
          if (letter.x + letter.width > containerSize.width) {
            letter.x = containerSize.width - letter.width;
            letter.dx = -letter.dx;
          }
          // 画面上端・下端
          if (letter.y < 0) {
            letter.y = 0;
            letter.dy = -letter.dy;
          }
          if (letter.y + letter.height > containerSize.height) {
            letter.y = containerSize.height - letter.height;
            letter.dy = -letter.dy;
          }
        }
        // 文字同士の衝突判定（簡易的に各文字を円とみなす）
        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const a = updated[i];
            const b = updated[j];
            const ax = a.x + a.width / 2;
            const ay = a.y + a.height / 2;
            const bx = b.x + b.width / 2;
            const by = b.y + b.height / 2;
            const dx = bx - ax;
            const dy = by - ay;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = a.width / 2 + b.width / 2;
            if (distance < minDistance) {
              // 衝突時は単純に速度を入れ替え（弾性衝突の簡易モデル）
              const tempDx = a.dx;
              const tempDy = a.dy;
              a.dx = b.dx;
              a.dy = b.dy;
              b.dx = tempDx;
              b.dy = tempDy;
              // 位置をわずかにずらして重なりを解消
              const overlap = (minDistance - distance) / 2;
              if (distance > 0) {
                const offsetX = (dx / distance) * overlap;
                const offsetY = (dy / distance) * overlap;
                a.x -= offsetX;
                a.y -= offsetY;
                b.x += offsetX;
                b.y += offsetY;
              }
            }
          }
        }
        return updated;
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [containerSize]);

  return (
    <BouncingTitleContainer ref={containerRef}>
      {letters.map(letter => (
        <LetterSpan key={letter.id} style={{ left: letter.x, top: letter.y }}>
          {letter.char}
        </LetterSpan>
      ))}
    </BouncingTitleContainer>
  );
};

const BouncingTitleContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px; /* タイトル領域の高さ（必要に応じて調整） */
  overflow: hidden;
  color: white;
`;

const LetterSpan = styled.span`
  position: absolute;
  font-size: 2rem;
  font-weight: bold;
  user-select: none;
  pointer-events: none;
`;

export default BouncingTitle;
