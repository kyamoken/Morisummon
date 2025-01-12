import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Header from '@/components/Header.tsx';
import useAuth from '@/hooks/useAuth';

const Gacha: React.FC = () => {
  const { gacha } = useAuth();
  const [result, setResult] = useState<string[] | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const handleGacha = async () => {
    setIsAnimating(true);
    const cards = await gacha();
    setResult(cards.map((card: any) => card.name));
    setIsAnimating(false);
  };

  return (
    <GachaContainer>
      <Header />
      <Content>
        <h1>ガチャページ</h1>
        <Banner src="../static/images/kyamokenICON.png" alt="Banner" />
        <Button onClick={handleGacha} disabled={isAnimating}>
          {isAnimating ? 'ガチャ中...' : 'ガチャを引く'}
        </Button>
        {isAnimating && <Animation />}
        {result && !isAnimating && (
          <Result>
            結果:
            <ul>
              {result.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </Result>
        )}
      </Content>
    </GachaContainer>
  );
};

const GachaContainer = styled.div`
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
  text-align: center;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Banner = styled.img`
  width: 200px;
  height: 200px;
  margin: 20px 0;
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

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Animation = styled.div`
  margin-top: 20px;
  width: 50px;
  height: 50px;
  border: 5px solid var(--primary-color);
  border-top: 5px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const Result = styled.div`
  margin-top: 20px;
  font-size: 18px;
  color: white;

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    margin: 5px 0;
  }
`;



export default Gacha;
