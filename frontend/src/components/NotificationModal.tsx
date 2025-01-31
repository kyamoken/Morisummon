import React from 'react';
import styled from 'styled-components';

interface NotificationModalProps {
  isOpen: boolean;
  notifications: any[];
  onClose: () => void;
  onMarkAsRead: (notificationId: number) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, notifications, onClose, onMarkAsRead }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}>×</CloseButton>
        <h2>通知</h2>
        <NotificationList>
          {notifications.map(notification => (
            <NotificationItem key={notification.id} isRead={notification.is_read}>
              <p>{notification.message}</p>
              {!notification.is_read && (
                <MarkAsReadButton onClick={() => onMarkAsRead(notification.id)}>
                  マークを既読にする
                </MarkAsReadButton>
              )}
            </NotificationItem>
          ))}
        </NotificationList>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); /* 背景を少し暗く */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--modal-background-default);
  padding: 20px;
  border-radius: 10px;
  width: 500px;
  max-height: 80%;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  color: #2d2d67;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: #333; /* 色を変更 */
`;

const NotificationList = styled.ul`
  list-style: none;
  padding: 0;
`;

const NotificationItem = styled.li<{ isRead: boolean }>`
  background-color: ${({ isRead }) => (isRead ? '#f0f0f0' : '#fff')};
  padding: 15px; /* パディングを増やす */
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* シャドウを追加 */
`;

const MarkAsReadButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 12px; /* パディングを調整 */
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s; /* ホバー時のエフェクトを追加 */
  &:hover {
    background-color: #0056b3;
  }
`;

export default NotificationModal;
