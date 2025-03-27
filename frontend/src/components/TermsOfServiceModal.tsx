import React from 'react';
import styled from 'styled-components';

type TermsOfServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        <Title>利用規約</Title>
        <Text>あなたがこれを見ているということはあなたはすでに同意しているでしょう。</Text>
      </ModalContent>
    </ModalOverlay>
  );
};

export default TermsOfServiceModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  animation: fadeIn 0.3s ease-in-out forwards;
  z-index: 1002;

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: var(--card-background);
  padding: 20px;
  border-radius: var(--border-radius);
  max-width: 500px;
  width: 100%;
  box-shadow: var(--box-shadow);
  transform: scale(0.8);
  animation: scaleIn 0.3s ease-in-out forwards;
  color: var(--privacy-service-text-color);
  position: relative;

  @media (max-width: 768px) {
    max-width: 90%;
    padding: 15px;
  }
  @media (max-width: 480px) {
    max-width: 95%;
    padding: 10px;
  }

  @keyframes scaleIn {
    to {
      transform: scale(1);
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-color);
  transition: color 0.3s;

  &:hover {
    color: var(--button-hover);
  }

  @media (max-width: 480px) {
    top: 8px;
    right: 8px;
    font-size: 20px;
  }
`;

const Title = styled.h2`
  margin-top: 0;
  text-align: center;
  font-size: 1.8rem;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
  @media (max-width: 480px) {
    font-size: 1.4rem;
  }
`;

const Text = styled.p`
  font-size: 1rem;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;
