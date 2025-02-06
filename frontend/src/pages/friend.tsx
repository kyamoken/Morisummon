// friend.tsx
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

interface ExchangeSession {
  exists: boolean;
  exchange_id: number;
  proposer_id: number; // 提案を行った側のユーザーID
}

const Friends: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<number | null>(null);
  // 交換セッションが存在する場合の状態（自分が提案中の場合のみ使用）
  const [exchangeSession, setExchangeSession] = useState<ExchangeSession | null>(null);
  // モーダル表示用：自分が提案中の場合のキャンセル確認
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);

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
      toast.error('フレンド一覧の取得に失敗しました。');
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
      toast.error('フレンドリクエストの取得に失敗しました。');
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
      toast.error('フレンドリクエストの送信に失敗しました。');
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
      toast.success('フレンドの削除が完了しました！');
      fetchFriends();
      setIsModalOpen(false);
      setFriendToRemove(null);
    } catch (error) {
      console.error('Failed to remove friend:', error);
      toast.error('フレンドの削除に失敗しました。');
    }
  };

  /**
   * カード交換を開始／確認する処理
   * ・既に交換セッションが存在する場合は、提案側か受信側かで挙動を変える
   * 　- 自分が提案側ならモーダルを表示して「提案中です！」かつキャンセル可能にする
   * 　- 自分が受信側なら交換画面へ遷移し、相手の提案カード等を確認できるようにする
   * ・存在しなければ新規に交換セッションを作成し、交換画面へ遷移する
   */
  const handleInitiateExchange = async (friendId: number) => {
    try {
      const checkResponse: {
        exists: boolean;
        exchange_ulid?: string;
        proposer_id?: number;
      } = await ky.get(`/api/check_exchange/${friendId}/`, {
        headers: { Authorization: `Token ${user?.token}` },
      }).json();

      if (checkResponse.exists) {
        if (checkResponse.proposer_id === user?.id) {
          setExchangeSession(checkResponse);
          setIsExchangeModalOpen(true);
        } else {
          // 受信側の場合は交換画面へ遷移
          navigate(`/exchange/${checkResponse.exchange_ulid}`);
        }
      } else {
        // 新規作成
        const createResponse: { exchange_ulid: string } = await ky.post('/api/exchanges/', {
          json: { receiver_id: friendId },
          headers: { Authorization: `Token ${user?.token}` },
        }).json();
        navigate(`/exchange/${createResponse.exchange_ulid}`);
      }
    } catch (error) {
      console.error('Failed to initiate exchange:', error);
      toast.error('カード交換の開始に失敗しました。');
    }
  };

  // 交換提案をキャンセルする処理（提案側のみ）
  const handleCancelExchange = async () => {
    if (!exchangeSession) return;
    try {
      await ky.post(`/api/exchanges/${exchangeSession.exchange_id}/cancel/`, {
        headers: { Authorization: `Token ${user?.token}` },
      });
      toast.success('提案をキャンセルしました。');
      setExchangeSession(null);
      setIsExchangeModalOpen(false);
    } catch (error) {
      console.error('Failed to cancel exchange:', error);
      toast.error('提案のキャンセルに失敗しました。');
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
                <Button onClick={() => handleRequestAction(request.id, 'accept')}>
                  承認
                </Button>
                <Button onClick={() => handleRequestAction(request.id, 'reject')}>
                  拒否
                </Button>
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

      {/* 提案中の場合のモーダル：提案側はキャンセルできる */}
      {isExchangeModalOpen && exchangeSession && (
        <ExchangeModalOverlay>
          <ExchangeModalContent>
            <ModalTitle>カード交換の提案中です！</ModalTitle>
            <ModalMessage>
              現在あなたの提案は保留状態です。相手が応答するまでお待ちください。
            </ModalMessage>
            <ButtonGroup>
              <CancelExchangeButton onClick={handleCancelExchange}>
                提案をキャンセルする
              </CancelExchangeButton>
              <CloseModalButton onClick={() => setIsExchangeModalOpen(false)}>
                閉じる
              </CloseModalButton>
            </ButtonGroup>
          </ExchangeModalContent>
        </ExchangeModalOverlay>
      )}
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

const DeleteButton = styled(Button)`
  background-color: #e74c3c;

  &:hover {
    background-color: #c0392b;
  }
`;

/* 交換提案用モーダル */
const ExchangeModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
`;

const ExchangeModalContent = styled.div`
  background-color: var(--modal-background-default);
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  color: #2d2d67;
  text-align: center;
`;

const ModalTitle = styled.h2`
  margin-bottom: 15px;
`;

const ModalMessage = styled.p`
  margin-bottom: 20px;
`;

const CancelExchangeButton = styled(Button)`
  background-color: #e74c3c;

  &:hover {
    background-color: #c0392b;
  }
`;

const CloseModalButton = styled(Button)`
  background-color: var(--primary-color);
`;

export default Friends;
