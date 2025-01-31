// NotificationModal.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ky } from '@/utils/api';

interface NotificationModalProps {
  isOpen: boolean;
  notifications: any[];
  onClose: () => void;
  onMarkAsRead: (notificationId: number) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, notifications, onClose, onMarkAsRead }) => {
  const [unreadCount, setUnreadCount] = useState(notifications.filter(n => !n.is_read).length);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.is_read).length);
  }, [notifications]);

  const handleMarkAsRead = async (notificationId: number) => {
    await ky.put(`/api/notifications/${notificationId}/`, {
      json: { is_read: true },
    });
    onMarkAsRead(notificationId);
    setUnreadCount(unreadCount - 1);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}>×</CloseButton>
        <h2>通知</h2>
        <NotificationList>
          {notifications.map(notification => (
            <NotificationItem key={notification.id} $isRead={notification.is_read}>
              <p>{notification.message}</p>
              {!notification.is_read && (
                <MarkAsReadButton onClick={() => handleMarkAsRead(notification.id)}>
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
  background-color: rgba(0, 0, 0, 0.7);
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
  color: #333;
`;

const NotificationList = styled.ul`
  list-style: none;
  padding: 0;
`;

const NotificationItem = styled.li<{ $isRead: boolean }>`
  background-color: ${({ $isRead }) => ($isRead ? '#f0f0f0' : '#fff')};
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MarkAsReadButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: #0056b3;
  }
`;

export default NotificationModal;
