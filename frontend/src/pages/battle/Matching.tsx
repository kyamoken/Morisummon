import { FloatingButton } from '@/components/FloatingButton';
import React from 'react';
import { Link } from 'react-router';
import styled, { keyframes } from 'styled-components';

type Props = {
  message: string;
}

const Matching: React.FC<Props> = ({ message }) => {
  return (
    <MatchingContainer>
      <MatchingHeader>{message}</MatchingHeader>
      <Spinner />

      <Center>
        <FloatingButton as={Link} to="/home">
          キャンセル
        </FloatingButton>
      </Center>
    </MatchingContainer>
  );
};

const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 25px;
`;

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

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const Spinner = styled.div`
  border: 8px solid rgba(255, 255, 255, 0.3);
  border-top: 8px solid white;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 1s linear infinite, ${fadeIn} 2s ease-in-out;
`;

export default Matching;
