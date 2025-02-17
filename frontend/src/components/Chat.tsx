// chat.tsx
import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
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
  // モーダルが完全に閉じた後、親側で状態を更新するためのコールバック
  onClose: () => void;
}

interface ChatGroup {
  id: number;
  name: string;
  members: { id: number; name: string }[];
}

const Chat: React.FC<ChatProps> = ({ isModalOpen, onClose }) => {
  // チャット関連のステート
  const [groupName, setGroupName] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const { sendJsonMessage, lastJsonMessage } = useWebSocket<Message>(
    groupName ? `ws://localhost:8000/ws/chat/${groupName}/` : null
  );
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // アニメーション用のステート
  const [shouldRender, setShouldRender] = useState(isModalOpen);
  const [animateIn, setAnimateIn] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  // モーダルが開くときのアニメーション処理
  useEffect(() => {
    if (isModalOpen) {
      setShouldRender(true);
      setAnimateOut(false);
      setAnimateIn(false);
      // 次のtickでanimateInをtrueにして開くアニメーションを発火
      setTimeout(() => setAnimateIn(true), 10);
    }
  }, [isModalOpen]);

  // WebSocket経由で新規メッセージを受信したら追加
  useEffect(() => {
    if (lastJsonMessage) {
      setReceivedMessages((prev) => [...prev, lastJsonMessage]);
    }
  }, [lastJsonMessage]);

  // 新規メッセージ時に自動スクロール
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [receivedMessages]);

  // グループ一覧を取得
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
      // 同じグループをクリックした場合はチャットを閉じる
      setGroupName(null);
      setSelectedGroupId(null);
      setReceivedMessages([]);
    } else {
      // 新しいグループを選択
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
        if (!token) throw new Error('認証トークンが見つかりません');
        const data = await ky
          .post('/api/chat/groups/create/', {
            json: { name: newGroupName },
            headers: { 'Authorization': `Bearer ${token}` }
          })
          .json<ChatGroup>();
        setChatGroups([...chatGroups, data]);
      } catch (error) {
        console.error('Error creating chat group:', error);
      }
    }
  };

  const handleAddUserToGroup = async (groupName: string, username: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('認証トークンが見つかりません');
      await ky.post(`/api/chat/groups/${groupName}/add-user/`, {
        json: { username: username },
        headers: { 'Authorization': `Bearer ${token}` }
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

  // 「閉じる」ボタン押下時：閉じるアニメーションを実行し、0.5秒後に onClose を呼び出す
  const handleClose = () => {
    setAnimateIn(false);
    setAnimateOut(true);
    setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 500);
  };

  if (!shouldRender) return null;

  return (
    <Modal animateIn={animateIn} animateOut={animateOut}>
      <ModalContent animateIn={animateIn} animateOut={animateOut}>
        <GroupButtons>
          {chatGroups.map((group) => (
            <GroupButton
              key={group.id}
              selected={selectedGroupId === group.id}
              onClick={() => handleGroupChange(group)}
            >
              {group.name}
            </GroupButton>
          ))}
          <GroupButton onClick={handleCreateGroup}>グループ作成</GroupButton>
          <GroupButton onClick={handleAddUser}>ユーザー追加</GroupButton>
        </GroupButtons>
        <ChatForm onSubmit={handleSubmit}>
          <input
            type="text"
            className="message-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="メッセージを入力..."
          />
          <button type="submit">送信</button>
        </ChatForm>
        <ChatItems>
          {receivedMessages.map((m, i) => (
            <ChatItem key={i}>
              <p>{m.message}</p>
              <small>
                By {m.sender.name} at {new Date(m.timestamp).toLocaleString()}
              </small>
            </ChatItem>
          ))}
          <div ref={chatEndRef} />
        </ChatItems>
        <CloseButton onClick={handleClose}>閉じる</CloseButton>
      </ModalContent>
    </Modal>
  );
};

export default Chat;

/* ----------------------------- */
/* Styled Components             */
/* ----------------------------- */

// Modal（オーバーレイ）は閉じるときも開くときも透明度で演出します
const Modal = styled.div<{ animateIn: boolean; animateOut: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* オーバーレイは半透明の黒 */
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  opacity: ${({ animateOut, animateIn }) =>
    animateOut ? 0 : animateIn ? 1 : 0};
  transition: opacity 0.5s ease-out;
`;

// ModalContent は背景色を --chat-modal-background（例：#303065）に設定し、Y軸方向のスライドでアニメーション
const ModalContent = styled.div<{ animateIn: boolean; animateOut: boolean }>`
  background-color: var(--chat-modal-background);
  padding: 20px;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateY(
    ${({ animateOut, animateIn }) => (animateOut ? '100px' : animateIn ? '0' : '100px')}
  );
  transition: transform 0.5s ease-out;
`;

const GroupButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

interface GroupButtonProps {
  selected?: boolean;
}

const GroupButton = styled.button<GroupButtonProps>`
  padding: 8px 16px;
  background-color: ${({ selected }) =>
    selected ? 'var(--button-hover)' : 'var(--primary-color)'};
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  &:hover {
    background-color: var(--button-hover);
  }
  &:focus {
    outline: solid 3px rgba(68, 155, 222, 0.4);
  }
`;

const ChatForm = styled.form`
  display: flex;
  gap: 8px;
  width: 100%;
  padding: 10px;
  input.message-input {
    flex: 1;
    padding: 8px;
    border-radius: var(--border-radius);
    border: none;
    font-size: 16px;
    &:focus {
      outline: solid 3px rgba(68, 155, 222, 0.4);
    }
  }
  button[type='submit'] {
    padding: 8px 16px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    &:hover {
      background-color: var(--button-hover);
    }
    &:focus {
      outline: solid 3px rgba(68, 155, 222, 0.4);
    }
  }
`;

const ChatItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
`;

const ChatItem = styled.div`
  padding: 8px 16px;
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  p {
    margin: 0;
    color: white;
  }
  small {
    color: #ccc;
  }
`;

const CloseButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 8px 16px;
  cursor: pointer;
  margin-top: 20px;
  &:hover {
    background-color: var(--button-hover);
  }
`;
