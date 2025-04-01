import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router'; // Link を追加
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

  const handleLogoClick = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/');
    }
  };

  const gachaStones = user?.magic_stones || 0;

  useEffect(() => {
    if (!user) return; // ログインしていなければ通知関連は取得しない
    const fetchUnreadCount = async () => {
      try {
        const response: any = await ky
          .get('/api/notifications/unread_count/', {
            headers: { Authorization: `Token ${localStorage.getItem('token')}` },
          })
          .json();
        setUnreadCount(response.unread_count);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
  }, [user]);

  const handleNotificationClick = async () => {
    try {
      const response: any = await ky
        .get('/api/notifications/', {
          headers: { Authorization: `Token ${localStorage.getItem('token')}` },
        })
        .json();
      setNotifications(response.notifications);
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
      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
      setUnreadCount(unreadCount - 1);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <HeaderContainer>
      <Logo
        src="/static/images/morisummonLOGO.png"
        alt="Logo"
        onClick={handleLogoClick}
      />
      <UserInfo>
        {/* ユーザーがログインしている場合のみ、チャット・通知ボタンを表示 */}
        {user && (
          <>
            <ChatButton onClick={() => setIsChatModalOpen(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-chat-fill"
                viewBox="0 0 16 16"
              >
                <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9 9 0 0 0 8 15" />
              </svg>
            </ChatButton>
            <NotificationButton onClick={handleNotificationClick}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-bell-fill"
                viewBox="0 0 16 16"
              >
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901" />
              </svg>
              {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
            </NotificationButton>
          </>
        )}
        <SettingsButton as={Link} to="/settings">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-gear-fill"
            viewBox="0 0 16 16"
          >
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
          </svg>
        </SettingsButton>
        {/* スマホサイズではユーザー名を非表示にする */}
        <Username>{user ? user.username : 'ゲスト さん'}</Username>
        <MagicStoneContainer>
          <MagicStoneImage src="/static/images/Magic_Stone.png" alt="Magic Stone" />
          <div>{gachaStones}</div>
        </MagicStoneContainer>
      </UserInfo>
      {/* ログインしている場合のみ、チャット・通知のモーダルを表示 */}
      {user && (
        <>
          <Chat isModalOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} />
          <NotificationModal
            isOpen={isNotificationModalOpen}
            notifications={notifications}
            onClose={() => setIsNotificationModalOpen(false)}
            onMarkAsRead={handleMarkAsRead}
          />
        </>
      )}
    </HeaderContainer>
  );
};

export default Header;

/* ----------------------- */
/* Styled Components       */
/* ----------------------- */

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

  @media (max-width: 768px) {
    height: 50px;
    padding: 0 10px;
  }
`;

const Logo = styled.img`
  width: 100px;
  height: 100px;
  cursor: pointer;

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
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
  white-space: nowrap;

  & > div {
    margin-left: 20px;
  }

  & > div:not(:last-child) {
    margin-right: 20px;
  }

  @media (max-width: 768px) {
    padding: 5px 10px;
    font-size: 14px;

    & > div {
      margin-left: 10px;
    }

    & > div:not(:last-child) {
      margin-right: 10px;
    }
  }
`;

// 追加：スマホサイズでは非表示になる Username コンポーネント
const Username = styled.div`
  @media (max-width: 768px) {
    display: none;
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
  display: flex;
  align-items: center;

  &:hover {
    background-color: #3a3b3e;
  }

  @media (max-width: 768px) {
    padding: 4px 8px;
    margin-right: 10px;

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const NotificationButton = styled(ChatButton)`
  position: relative;
  font-size: 24px;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const SettingsButton = styled(ChatButton)`
  @media (max-width: 768px) {
    padding: 4px 8px;

    svg {
      width: 14px;
      height: 14px;
    }
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

  @media (max-width: 768px) {
    padding: 3px 6px;
    font-size: 10px;
    top: -3px;
    right: -6px;
  }
`;

const MagicStoneContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 4px;
    font-size: 14px;
  }
`;

const MagicStoneImage = styled.img`
  width: 20px;
  height: 20px;
  object-fit: cover;

  @media (max-width: 768px) {
    width: 16px;
    height: 16px;
  }
`;
