import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import useAuth from '@/hooks/useAuth.tsx';
import Chat from './Chat.tsx';
import NotificationModal from './NotificationModal';
import { ky } from '@/utils/api';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);

  const handleLogoClick = () => {
    navigate('/');
  };

  const gachaStones = user?.magic_stones || 0;

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await ky.get('/api/notifications/unread_count/', {
          headers: { Authorization: `Token ${localStorage.getItem('token')}` },
        }).json();
        setUnreadCount(response.unread_count);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
  }, []);

  const handleNotificationClick = async () => {
    try {
      const response = await ky.get('/api/notifications/', {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      }).json();
      setNotifications(response.notifications);
      setSelectedNotification(response.notifications[0]); // 最初の通知を選択
      setIsNotificationModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await ky.put(`/api/notifications/${notificationId}/`, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      });
      setNotifications(notifications.map(notification =>
        notification.id === notificationId ? { ...notification, is_read: true } : notification
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <HeaderContainer>
      <img
        src="/static/images/morisummonLOGO.png"
        alt="Logo"
        width="100"
        height="100"
        onClick={handleLogoClick}
        style={{ cursor: 'pointer' }}
      />
      <UserInfo>
        <ChatButton onClick={() => setIsChatModalOpen(true)}>チャット</ChatButton>
        <NotificationButton onClick={handleNotificationClick}>
          <i className="fas fa-envelope"></i>
          {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
        </NotificationButton>
        <div>{user ? user.username + " さん" : 'ゲスト さん'}</div>
        <div>魔法石: {gachaStones}</div>
      </UserInfo>
      <Chat isModalOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} />
      <NotificationModal
        isOpen={isNotificationModalOpen}
        notifications={notifications}
        onClose={() => setIsNotificationModalOpen(false)}
        onMarkAsRead={handleMarkAsRead}
      />
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background-color: rgba(45, 45, 103, 0.8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
  box-shadow: var(--box-shadow);
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  color: white;
  font-size: 16px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  & > div {
    margin-left: 20px;
  }

  & > div:not(:last-child) {
    margin-right: 20px;
  }
`;

const ChatButton = styled.button`
  background-color: #2a2b2e;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  margin-right: 20px;
  &:hover {
    background-color: #3a3b3e;
  }
`;

const NotificationButton = styled(ChatButton)`
  position: relative;
  font-size: 24px;

  & > i {
    margin-right: 8px;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -5px;
  right: -10px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 5px 10px;
  font-size: 12px;
`;

export default Header;
