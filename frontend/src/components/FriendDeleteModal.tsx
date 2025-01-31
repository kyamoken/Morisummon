import React from 'react';
import styled from 'styled-components';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const FriendDeleteModal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <p>本当に削除しますか？</p>
        <Button onClick={onConfirm}>はい</Button>
        <Button onClick={onClose}>いいえ</Button>
      </ModalContent>
    </ModalOverlay>
  );
};

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
`;

const ModalContent = styled.div`
  background: var(--friend-delete-modal-background);
  padding: 20px;
  border-radius: var(--border-radius);
  text-align: center;
  color: var(--friend-delete-modal-text-color);
`;

const Button = styled.button`
  margin: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
`;

export default FriendDeleteModal;
