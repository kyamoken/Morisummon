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
  exchange_ulid: string;
  proposer_id: number;
}

const Friends: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<number | null>(null);
  // 交換セッションの状態（存在する場合）
  const [exchangeSession, setExchangeSession] = useState<ExchangeSession | null>(null);
  // 交換提案に関するモーダルの表示状態
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
   * 交換開始／確認処理
   *
   * 1. /api/check_exchange/{friendId}/ にて既存の交換セッションを確認
   * 2. 既に存在していれば、レスポンスの status によって処理を分岐
   *    - status が 'proposed' の場合は、モーダルを表示してキャンセルまたは確認を促す
   *    - それ以外の場合は、直接交換画面へ遷移
   * 3. 交換セッションが存在しなければ、新規作成してカード選択画面に遷移
   */
  const handleInitiateExchange = async (friendId: number) => {
    try {
      const checkResponse: {
        exists: boolean;
        status?: string;
        exchange_ulid?: string;
        proposer_id?: number;
      } = await ky
        .get(`/api/check_exchange/${friendId}/`, {
          headers: { Authorization: `Token ${user?.token}` },
        })
        .json();

      if (checkResponse.exists) {
        if (checkResponse.status === 'proposed') {
          // 既に「提案済み」の場合はモーダルでユーザーに対応を促す
          setExchangeSession({
            exists: true,
            exchange_ulid: checkResponse.exchange_ulid!,
            proposer_id: checkResponse.proposer_id!,
          });
          setIsExchangeModalOpen(true);
        } else {
          // 例: 既に交換が成立している場合などは直接その画面へ遷移
          navigate(`/exchange/${checkResponse.exchange_ulid}`);
        }
      } else {
        // 新規作成の場合：新しい交換セッションを作成してカード選択画面へ遷移
        const createResponse: { exchange_ulid: string } = await ky
          .post('/api/exchanges/', {
            json: { receiver_id: friendId },
            headers: { Authorization: `Token ${user?.token}` },
          })
          .json();
        setExchangeSession(null);
        navigate(`/exchange/${createResponse.exchange_ulid}`);
      }
    } catch (error) {
      console.error('Failed to initiate exchange:', error);
      toast.error('カード交換の開始に失敗しました。');
    }
  };

  // 提案側の場合：既存の交換セッションをキャンセルする処理
  const handleCancelExchange = async () => {
    if (!exchangeSession) return;
    try {
      await ky.post(`/api/exchanges/${exchangeSession.exchange_ulid}/cancel/`, {
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

  // 受信側の場合：相手の提案を確認して交換成立させる処理
  const handleConfirmExchange = async () => {
    if (!exchangeSession) return;
    try {
      await ky.post(`/api/exchanges/${exchangeSession.exchange_ulid}/confirm/`, {
        headers: { Authorization: `Token ${user?.token}` },
      });
      toast.success('交換が成立しました！');
      setExchangeSession(null);
      setIsExchangeModalOpen(false);
      navigate('/friends');
    } catch (error) {
      console.error('Failed to confirm exchange:', error);
      toast.error('交換成立に失敗しました。');
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

      {/* 交換セッションが存在する場合は、モーダルで操作させる */}
      {isExchangeModalOpen && exchangeSession && (
        <ExchangeModalOverlay>
          <ExchangeModalContent>
            {exchangeSession.proposer_id === user?.id ? (
              <>
                <ModalTitle>あなたは既にカード交換を提案中です！</ModalTitle>
                <ModalMessage>
                  現在提案中です。相手の返答を待つか、提案をキャンセルしてください。
                </ModalMessage>
                <ButtonGroup>
                  <CancelExchangeButton onClick={handleCancelExchange}>
                    提案をキャンセルする
                  </CancelExchangeButton>
                  <CloseModalButton onClick={() => setIsExchangeModalOpen(false)}>
                    閉じる
                  </CloseModalButton>
                </ButtonGroup>
              </>
            ) : (
              <>
                <ModalTitle>相手がカード交換を提案しています！</ModalTitle>
                <ModalMessage>
                  相手の提案を確認してください。内容に問題なければ「交換成立」ボタンを押してください。
                </ModalMessage>
                <ButtonGroup>
                  <ConfirmExchangeButton onClick={handleConfirmExchange}>
                    交換成立
                  </ConfirmExchangeButton>
                  <CloseModalButton onClick={() => setIsExchangeModalOpen(false)}>
                    閉じる
                  </CloseModalButton>
                </ButtonGroup>
              </>
            )}
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

const ConfirmExchangeButton = styled(Button)`
  background-color: #27ae60;

  &:hover {
    background-color: #1e8e50;
  }
`;

const CloseModalButton = styled(Button)`
  background-color: var(--primary-color);
`;

export default Friends;
