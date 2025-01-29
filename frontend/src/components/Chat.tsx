import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import useWebSocket from 'react-use-websocket';

interface Message {
  message: string;
  sender: {
    id: number;
    name: string;
  };
  timestamp: string;
}

interface ChatProps {
  isModalOpen: boolean;
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ isModalOpen, onClose }) => {
  const groupName = 'test';
  const { sendJsonMessage, lastJsonMessage } = useWebSocket<Message>(
    groupName ? `ws://localhost:8000/ws/chat/${groupName}/` : null
  );
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue || !groupName) return;
    sendJsonMessage({ message: inputValue });
    setInputValue('');
  };

  if (!isModalOpen) return null;

  return (
    <Modal>
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
              <small style={{ color: 'gray' }}>By {m.sender.name} at {new Date(m.timestamp).toLocaleString()}</small>
            </ChatItem>
          ))}
          <div ref={chatEndRef} />
        </ChatItems>
        <CloseButton onClick={onClose}>閉じる</CloseButton>
      </ModalContent>
    </Modal>
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
  background-color: var(--modal-content-background);
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

export default Chat;
