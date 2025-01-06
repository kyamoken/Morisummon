import React from 'react';
import styled, { keyframes } from 'styled-components';

const Matching: React.FC = () => {
  return (
    <MatchingContainer>
      <MatchingHeader>対戦相手をさがしています...</MatchingHeader>
      <Spinner />
    </MatchingContainer>
  );
};

const MatchingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: var(--background-color);
  color: white;
`;

const MatchingHeader = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 8px solid rgba(255, 255, 255, 0.3);
  border-top: 8px solid white;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 1s linear infinite;
`;

export default Matching;
