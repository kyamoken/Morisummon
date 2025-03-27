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
        <Title>通知</Title>
        <NotificationList>
          {notifications.map(notification => (
            <NotificationItem key={notification.id} $isRead={notification.is_read}>
              <NotificationText>{notification.message}</NotificationText>
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

export default NotificationModal;

/* ------------------ Styled Components ------------------ */

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
  background-color: var(--notification-modal-background);
  padding: 20px;
  border-radius: var(--border-radius);
  width: 500px;
  max-height: 80%;
  overflow-y: auto;
  box-shadow: var(--box-shadow);
  position: relative;
  color: white;

  @media (max-width: 768px) {
    width: 90%;
    padding: 15px;
  }
  @media (max-width: 480px) {
    width: 95%;
    padding: 10px;
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

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: white;
  transition: color 0.3s;

  &:hover {
    color: var(--button-hover);
  }

  @media (max-width: 480px) {
    font-size: 20px;
    top: 8px;
    right: 8px;
  }
`;

const NotificationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 20px 0 0;
`;

const NotificationItem = styled.li<{ $isRead: boolean }>`
  background-color: ${({ $isRead }) => ($isRead ? 'var(--card-background)' : 'var(--primary-color)')};
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid var(--button-hover);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 480px) {
    padding: 10px;
    gap: 8px;
  }
`;

const NotificationText = styled.p`
  margin: 0;
  font-size: 14px;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const MarkAsReadButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.3s;
  align-self: flex-end;

  &:hover {
    background-color: var(--button-hover);
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;
