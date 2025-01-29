import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import useWebSocket from 'react-use-websocket';
import { ky } from '@/utils/api';

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

interface ChatGroup {
  id: number;
  name: string;
  members: { id: number; name: string }[];
}

const Chat: React.FC<ChatProps> = ({ isModalOpen, onClose }) => {
  const [groupName, setGroupName] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const { sendJsonMessage, lastJsonMessage } = useWebSocket<Message>(
    groupName ? `ws://localhost:8000/ws/chat/${groupName}/` : null
  );
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
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

  useEffect(() => {
    fetchChatGroups();
  }, []);

  const fetchChatGroups = async () => {
    try {
      const data = await ky.get('/api/chat/groups/').json<ChatGroup[]>();
      setChatGroups(data);
    } catch (error) {
      console.error('Error fetching chat groups:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue || !groupName) return;
    sendJsonMessage({ message: inputValue });
    setInputValue('');
  };

  const handleGroupChange = (group: ChatGroup) => {
    if (selectedGroupId === group.id) {
      // 同じグループを再度クリックした場合、チャットを閉じる
      setGroupName(null);
      setSelectedGroupId(null);
      setReceivedMessages([]);
    } else {
      // 新しいグループを選択した場合
      setGroupName(group.name);
      setSelectedGroupId(group.id);
      setReceivedMessages([]);
    }
  };

  const handleCreateGroup = async () => {
    const newGroupName = prompt('新しいグループ名を入力してください:');
    if (newGroupName) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('認証トークンが見つかりません');
        }
        const data = await ky.post('/api/chat/groups/create/', {
          json: { name: newGroupName },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).json<ChatGroup>();
        setChatGroups([...chatGroups, data]);
      } catch (error) {
        console.error('Error creating chat group:', error);
      }
    }
  };

  const handleAddUserToGroup = async (groupName: string, username: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('認証トークンが見つかりません');
      }
      await ky.post(`/api/chat/groups/${groupName}/add-user/`, {
        json: { username: username },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('ユーザーがグループに追加されました');
    } catch (error) {
      console.error('Error adding user to group:', error);
      alert('ユーザーの追加に失敗しました');
    }
  };

  const handleAddUser = () => {
    const username = prompt('追加するユーザー名を入力してください:');
    if (!username || !groupName) {
      alert('無効なユーザー名またはグループ名です');
      return;
    }
    handleAddUserToGroup(groupName, username);
  };

  if (!isModalOpen) return null;

  return (
    <Modal>
      <ModalContent>
        <GroupButtons>
          {chatGroups.map(group => (
            <button
              key={group.id}
              onClick={() => handleGroupChange(group)}
              style={{
                backgroundColor: selectedGroupId === group.id ? '#4a4b4e' : '#2a2b2e',
                color: 'white',
              }}
            >
              {group.name}
            </button>
          ))}
          <button onClick={handleCreateGroup}>グループ作成</button>
          <button onClick={handleAddUser}>ユーザー追加</button>
        </GroupButtons>
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
  width: 90%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${slideUp} 0.5s ease-out;
`;

const GroupButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  button {
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
  max-height: 400px;
  overflow-y: auto;
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
