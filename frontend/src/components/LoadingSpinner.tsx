// components/LoadingSpinner.tsx
import React from 'react';
import styled, { keyframes } from 'styled-components';

// スピナーアニメーション
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
`;

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium' }) => {
  const sizes = {
    small: '20px',
    medium: '40px',
    large: '60px',
  };

  return <Spinner style={{ width: sizes[size], height: sizes[size] }} />;
};

export default LoadingSpinner;
