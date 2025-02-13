// BubblesBackground.tsx
import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';

const BubblesBackground: React.FC = () => {
  const bubbles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      arr.push({
        left: Math.random() * 100,
        size: Math.random() * 40 + 10,
        delay: Math.random() * 5,
      });
    }
    return arr;
  }, []);

  return (
    <Container>
      {bubbles.map((bubble, index) => (
        <Bubble
          key={index}
          left={bubble.left}
          size={bubble.size}
          delay={bubble.delay}
        />
      ))}
    </Container>
  );
};

export default BubblesBackground;

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
`;

const rise = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-120vh) scale(0.5); opacity: 0; }
`;

const Bubble = styled.div<{ left: number; size: number; delay: number }>`
  position: absolute;
  bottom: -150px;
  left: ${({ left }) => left}%;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: ${rise} 10s linear infinite;
  animation-delay: ${({ delay }) => delay}s;
`;
