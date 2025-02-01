import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ky } from '@/utils/api';
import Header from '@/components/Header.tsx';
import useAuth from '@/hooks/useAuth.tsx';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router';
import FriendDeleteModal from '@/components/FriendDeleteModal.tsx';

interface Friend {
  id: number;
  username: string;
}

interface FriendRequest {
  id: number;
  from_user: string;
}

const Friends: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<number | null>(null);

  const fetchFriends = async () => {
    try {
      const response: { friends: Friend[] } = await ky
        .get('/api/friends/', {
          headers: { Authorization: `Token ${user?.token}` },
        })
        .json();
      setFriends(response.friends);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
      toast.error('Failed to fetch friends.');
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response: { requests: FriendRequest[] } = await ky
        .get('/api/friends/requests/', {
          headers: { Authorization: `Token ${user?.token}` },
        })
        .json();
      setRequests(response.requests);
    } catch (error) {
      console.error('Failed to fetch friend requests:', error);
      toast.error('フレンド一覧の取得に失敗しました:(');
    }
  };

  const handleSendRequest = async () => {
    try {
      await ky.post('/api/friends/request/', {
        json: { username: username },
        headers: { Authorization: `Token ${user?.token}` },
      });
      toast.success('フレンドリクエストが正常に送信されました！');
      setUsername('');
    } catch (error) {
      console.error('Failed to send friend request:', error);
      toast.error('フレンドリクエストの送信に失敗しました...');
    }
  };

  const handleRequestAction = async (requestId: number, action: 'accept' | 'reject') => {
    try {
      await ky.put(`/api/friends/requests/${requestId}/`, {
        headers: { Authorization: `Token ${user?.token}` },
        json: { action },
      });
      const actionText = action === 'accept' ? '承認' : '拒否';
      toast.success(`フレンドリクエストを${actionText}しました。`);
      fetchFriendRequests();
      fetchFriends();
    } catch (error) {
      console.error('Failed to handle friend request:', error);
      toast.error('フレンドリクエストの処理に失敗しました。');
    }
  };

  const handleRemoveFriend = async () => {
    if (friendToRemove === null) return;
    try {
      await ky.delete(`/api/friends/${friendToRemove}/`, {
        headers: { Authorization: `Token ${user?.token}` },
      });
      toast.success('フレンドの削除を正常に完了しました！');
      fetchFriends();
      setIsModalOpen(false);
      setFriendToRemove(null);
    } catch (error) {
      console.error('Failed to remove friend:', error);
      toast.error('フレンドの削除に失敗しました！');
    }
  };

const handleInitiateExchange = async (friendId: number) => {
  try {
    // 既存のセッションをチェック
    const checkResponse = await ky.get(`/api/check_exchange/${friendId}/`, {
      headers: { Authorization: `Token ${user?.token}` }
    }).json();

    if (checkResponse.exists) {
      navigate(`/exchange/${checkResponse.exchange_id}`);
      return;
    }

    // 新しいセッションを作成
    const createResponse = await ky.post('/api/exchanges/', {
      json: { receiver_id: friendId },
      headers: { Authorization: `Token ${user?.token}` }
    }).json();

    navigate(`/exchange/${createResponse.exchange_id}`);
  } catch (error) {
    console.error('Failed to initiate exchange:', error);
    toast.error('交換の開始に失敗しました');
  }
};

  const confirmRemoveFriend = (friendId: number) => {
    setFriendToRemove(friendId);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, []);

  return (
    <FriendsContainer>
      <Header />
      <Content>
        <h1>フレンド</h1>

        <Form>
          <Input
            type="text"
            placeholder="ユーザー名を入力"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button onClick={handleSendRequest}>フレンドリクエストを送信</Button>
        </Form>

        <Section>
          <h2>フレンドリクエスト</h2>
          {requests.length > 0 ? (
            requests.map((request) => (
              <RequestItem key={request.id}>
                <span>{request.from_user} からのリクエスト</span>
                <Button onClick={() => handleRequestAction(request.id, 'accept')}>承認</Button>
                <Button onClick={() => handleRequestAction(request.id, 'reject')}>拒否</Button>
              </RequestItem>
            ))
          ) : (
            <p>フレンドリクエストはありません。</p>
          )}
        </Section>

        <Section>
          <h2>フレンド一覧</h2>
          {friends.length > 0 ? (
            friends.map((friend) => (
              <FriendItem key={friend.id}>
                <span>{friend.username}</span>
                <ButtonGroup>
                  <ExchangeButton onClick={() => handleInitiateExchange(friend.id)}>
                    カード交換
                  </ExchangeButton>
                  <DeleteButton onClick={() => confirmRemoveFriend(friend.id)}>
                    削除
                  </DeleteButton>
                </ButtonGroup>
              </FriendItem>
            ))
          ) : (
            <p>フレンドがいません。</p>
          )}
        </Section>
      </Content>
      <FriendDeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleRemoveFriend}
      />
    </FriendsContainer>
  );
};

const FriendsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color);
  color: white;
  width: 100%;
  min-height: 100vh;
`;

const Content = styled.div`
  width: 100%;
  max-width: 800px;
  padding: 20px;
`;

const Form = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: var(--border-radius);
  border: 1px solid #ccc;
  flex: 1;
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--button-hover);
  }
`;

const Section = styled.section`
  margin-bottom: 30px;
`;

const RequestItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #444;
`;

const FriendItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #444;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const ExchangeButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--button-hover);
  }
`;

// DeleteButton コンポーネントを Button を継承して定義
const DeleteButton = styled(Button)`
  background-color: #e74c3c;

  &:hover {
    background-color: #c0392b;
  }
`;

export default Friends;
