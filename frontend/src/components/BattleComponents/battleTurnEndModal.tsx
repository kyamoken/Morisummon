import React from 'react';
import styled from 'styled-components';

type BattleTurnEndModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  z-index: 1001;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.h2`
  margin-top: 0;
`;

const ModalContent = styled.p`
  margin: 1rem 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const ConfirmButton = styled.button`
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const CancelButton = styled.button`
  background-color: #6c757d;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #5a6268;
  }
`;

const BattleTurnEndModal: React.FC<BattleTurnEndModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>ターン終了確認</ModalHeader>
        <ModalContent>本当にターンを終了しますか？</ModalContent>
        <ButtonContainer>
          <CancelButton onClick={onCancel}>キャンセル</CancelButton>
          <ConfirmButton onClick={onConfirm}>終了する</ConfirmButton>
        </ButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default BattleTurnEndModal;
