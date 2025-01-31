import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ky } from '@/utils/api';
import Header from '@/components/Header.tsx';
import useAuth from '@/hooks/useAuth.tsx';

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
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [username, setUsername] = useState('');

  // フレンド一覧を取得
  const fetchFriends = async () => {
    try {
      const response: { friends: Friend[] } = await ky.get('/api/friends/', {
        headers: { Authorization: `Token ${user?.token}` },
      }).json();
      setFriends(response.friends);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  };

  // フレンドリクエスト一覧を取得
  const fetchFriendRequests = async () => {
    try {
      const response: { requests: FriendRequest[] } = await ky.get('/api/friends/requests/', {
        headers: { Authorization: `Token ${user?.token}` },
      }).json();
      setRequests(response.requests);
    } catch (error) {
      console.error('Failed to fetch friend requests:', error);
    }
  };

  // フレンドリクエストを送信
  const handleSendRequest = async () => {
    try {
      await ky.post('/api/friends/request/', {
        json: { username: username }, // ユーザーネームを送信
        headers: { Authorization: `Token ${user?.token}` },
      });
      alert('Friend request sent!');
      setUsername('');
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('Failed to send friend request.');
    }
  };

  // フレンドリクエストを承認または拒否
  const handleRequestAction = async (requestId: number, action: 'accept' | 'reject') => {
    try {
      await ky.put(`/api/friends/requests/${requestId}/`, {
        headers: { Authorization: `Token ${user?.token}` },
        json: { action },
      });
      alert(`Friend request ${action}ed.`);
      fetchFriendRequests(); // リクエスト一覧を再取得
      fetchFriends(); // フレンド一覧を再取得
    } catch (error) {
      console.error('Failed to handle friend request:', error);
      alert('Failed to handle friend request.');
    }
  };

  // フレンドを削除
  const handleRemoveFriend = async (friendId: number) => {
    try {
      await ky.delete(`/api/friends/${friendId}/`, {
        headers: { Authorization: `Token ${user?.token}` },
      });
      alert('Friend removed.');
      fetchFriends(); // フレンド一覧を再取得
    } catch (error) {
      console.error('Failed to remove friend:', error);
      alert('Failed to remove friend.');
    }
  };

  // コンポーネントがマウントされたときにデータを取得
  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, []);

  return (
    <FriendsContainer>
      <Header />
      <Content>
        <h1>フレンド</h1>

        {/* フレンドリクエスト送信フォーム */}
        <Form>
          <Input
            type="text"
            placeholder="ユーザー名を入力"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button onClick={handleSendRequest}>フレンドリクエストを送信</Button>
        </Form>

        {/* フレンドリクエスト一覧 */}
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

        {/* フレンド一覧 */}
        <Section>
          <h2>フレンド一覧</h2>
          {friends.length > 0 ? (
            friends.map((friend) => (
              <FriendItem key={friend.id}>
                <span>{friend.username}</span>
                <Button onClick={() => handleRemoveFriend(friend.id)}>削除</Button>
              </FriendItem>
            ))
          ) : (
            <p>フレンドがいません。</p>
          )}
        </Section>
      </Content>
    </FriendsContainer>
  );
};

// スタイル定義
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

export default Friends;
