import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import styled, { keyframes } from 'styled-components';
import useAuth from '@/hooks/useAuth.tsx';
import useWebSocket from 'react-use-websocket';

interface Message {
  message: string;
  user?: {
    name: string;
  };
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendJsonMessage, lastJsonMessage } = useWebSocket<Message>('ws://localhost:8000/ws/somepath/');

  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (lastJsonMessage) {
      setReceivedMessages((prev) => [...prev, lastJsonMessage]);
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [receivedMessages]);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) return;
    sendJsonMessage({ message: inputValue });
    setInputValue('');
  };

  const gachaStones = user?.magic_stones || 0;

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
        <ChatButton onClick={() => setIsModalOpen(true)}>チャット</ChatButton>
        <div>{user ? user.username + " さん" : 'ゲスト さん'}</div>
        <div>魔法石: {gachaStones}</div>
      </UserInfo>
      {isModalOpen ? <Modal>
        <ModalContent>
          <ChatForm onSubmit={handleSubmit}>
            <input
              type="text"
              className="message-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit">送信</button>
          </ChatForm>
          <ChatItems>
            {receivedMessages.map((m, i) => (
              <ChatItem key={i}>
                <p>{m.message}</p>
                <small style={{ color: 'gray' }}>By {m?.user?.name || 'Anonymous'}</small>
              </ChatItem>
            ))}
            <div ref={chatEndRef} />
          </ChatItems>
          <CloseButton onClick={() => setIsModalOpen(false)}>閉じる</CloseButton>
        </ModalContent>
      </Modal> : null}
    </HeaderContainer>
  );
};

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`;

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

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(211, 211, 211, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  animation: ${fadeIn} 0.5s ease-out;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${slideUp} 0.5s ease-out;
`;

const ChatForm = styled.form`
  display: flex;
  padding: 10px;
  gap: 8px;
  width: 100%;
  .message-input {
    flex: 1;
    padding: 8px;
    border-radius: 8px;
    border: none;
    &:focus {
      outline: solid 3px rgba(68, 155, 222, 0.4);
    }
  }
  button[type="submit"] {
    padding: 8px 16px;
    background-color: #2a2b2e;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    &:hover {
      background-color: #3a3b3e;
    }
    &:focus {
      outline: solid 3px rgba(68, 155, 222, 0.4);
    }
  }
`;

const ChatItems = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 10px;
  width: 100%;
  max-height: 150px; /* チャット3個分の高さに固定 */
  overflow-y: auto; /* スクロールを許可 */
`;

const ChatItem = styled.div`
  padding: 8px 16px;
  background-color: #2a2b2e;
  border-radius: 8px;
  p {
    margin: 0;
    color: white;
  }
`;

const CloseButton = styled.button`
  background-color: #2a2b2e;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  margin-top: 20px;
  &:hover {
    background-color: #3a3b3e;
  }
`;

export default Header;
