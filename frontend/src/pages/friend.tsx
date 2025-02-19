// friend.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ky } from '@/utils/api';
import Header from '@/components/Header';
import useAuth from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router';
import FriendDeleteModal from '@/components/FriendDeleteModal';
import BubblesBackground from '@/components/BubblesBackground';
import { FloatingButton, FloatingDangerButton } from '@/components/FloatingButton';

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
  const [exchangeSession, setExchangeSession] = useState<ExchangeSession | null>(null);
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

  const confirmRemoveFriend = (friendId: number) => {
    setFriendToRemove(friendId);
    setIsModalOpen(true);
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
   * カード交換開始／確認処理
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
          setExchangeSession({
            exists: true,
            exchange_ulid: checkResponse.exchange_ulid!,
            proposer_id: checkResponse.proposer_id!,
          });
          setIsExchangeModalOpen(true);
        } else {
          navigate(`/exchange/${checkResponse.exchange_ulid}`);
        }
      } else {
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

  // 提案側がキャンセル
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

  // 受信側が確認
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

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, []);

  return (
    <FriendsContainer>
      {/* 背面のバブル背景 */}
      <BubblesBackground />

      {/* ヘッダー */}
      <HeaderWrapper>
        <Header />
      </HeaderWrapper>

      {/* コンテンツ部分 */}
      <ContentWrapper>
        <MainContainer>
          {/* 左カラム：フレンド追加／フレンドリクエスト */}
          <LeftColumn>
            <Card>
              <SectionTitle>フレンドを追加</SectionTitle>
              <InputRow>
                <StyledInput
                  type="text"
                  placeholder="ユーザー名を入力してください。"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <SendFloatingButton onClick={handleSendRequest}>
                  送信
                </SendFloatingButton>
              </InputRow>
            </Card>

            <Card>
              <SectionTitle>フレンドリクエスト</SectionTitle>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <RequestItem key={request.id}>
                    <RequestText>{request.from_user}</RequestText>
                    <RequestButtonGroup>
                      <ActionFloatingButton onClick={() => handleRequestAction(request.id, 'accept')}>
                        承認
                      </ActionFloatingButton>
                      <RejectFloatingButton onClick={() => handleRequestAction(request.id, 'reject')}>
                        拒否
                      </RejectFloatingButton>
                    </RequestButtonGroup>
                  </RequestItem>
                ))
              ) : (
                <NoRequestText>フレンドリクエストは届いていません...</NoRequestText>
              )}
            </Card>
          </LeftColumn>

          {/* 右カラム：フレンド一覧 */}
          <RightColumn>
            <Card>
              <SectionTitle>フレンド一覧</SectionTitle>
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <FriendItem key={friend.id}>
                    <FriendName>{friend.username}</FriendName>
                    <FriendButtonGroup>
                      <ActionFloatingButton onClick={() => handleInitiateExchange(friend.id)}>
                        カード交換
                      </ActionFloatingButton>
                      <CustomFloatingDangerButton onClick={() => confirmRemoveFriend(friend.id)}>
                        削除
                      </CustomFloatingDangerButton>
                    </FriendButtonGroup>
                  </FriendItem>
                ))
              ) : (
                <NoRequestText>
                  フレンドがいません！ <br />
                  フレンドを追加してみましょう。
                </NoRequestText>
              )}
            </Card>
          </RightColumn>
        </MainContainer>
      </ContentWrapper>

      {/* フレンド削除モーダル */}
      <FriendDeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleRemoveFriend}
      />

      {/* カード交換モーダル */}
      {isExchangeModalOpen && exchangeSession && (
        <ExchangeModalOverlay>
          <ExchangeModalContent>
            {exchangeSession.proposer_id === user?.id ? (
              <>
                <ModalTitle>You have already proposed an exchange!</ModalTitle>
                <ModalMessage>
                  Waiting for the other user’s response. You can cancel the proposal if you want.
                </ModalMessage>
                <ButtonGroup>
                  <CustomFloatingDangerButton onClick={handleCancelExchange}>
                    Cancel Proposal
                  </CustomFloatingDangerButton>
                  <CloseFloatingButton onClick={() => setIsExchangeModalOpen(false)}>
                    Close
                  </CloseFloatingButton>
                </ButtonGroup>
              </>
            ) : (
              <>
                <ModalTitle>They have proposed an exchange!</ModalTitle>
                <ModalMessage>
                  Confirm the proposal if you want to proceed with the card exchange.
                </ModalMessage>
                <ButtonGroup>
                  <ConfirmFloatingButton onClick={handleConfirmExchange}>
                    Confirm Exchange
                  </ConfirmFloatingButton>
                  <CloseFloatingButton onClick={() => setIsExchangeModalOpen(false)}>
                    Close
                  </CloseFloatingButton>
                </ButtonGroup>
              </>
            )}
          </ExchangeModalContent>
        </ExchangeModalOverlay>
      )}
    </FriendsContainer>
  );
};

export default Friends;

/* =======================
   ホームページと同じデザインを適用するためのスタイル
========================== */
const FriendsContainer = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  color: white;
  text-align: center;
  background: linear-gradient(270deg, #383875, #6f6fa8, #383875);
  background-size: 600% 600%;
  animation: gradientAnimation 15s ease infinite;

  @keyframes gradientAnimation {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

const HeaderWrapper = styled.div`
  position: relative;
  z-index: 998;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 10;
  margin-top: 130px;
  padding: 20px;
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 40px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  max-width: 400px;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  max-width: 600px;
`;

const Card = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(6px);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`;

const SectionTitle = styled.h2`
  margin: 0 0 15px 0;
  font-size: 1.4rem;
`;

const InputRow = styled.div`
  display: flex;
  gap: 10px;
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  outline: none;
`;

const RequestItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(255, 255, 255, 0.15);
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;
`;

const RequestText = styled.span`
  font-size: 0.95rem;
`;

const RequestButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const NoRequestText = styled.p`
  margin: 0;
  opacity: 0.8;
`;

const FriendItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.15);
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;
`;

const FriendName = styled.span`
  font-size: 1rem;
`;

const FriendButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

/* モーダル系 */
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
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  color: #2d2d67;
  text-align: center;
`;

const ModalTitle = styled.h2`
  margin-bottom: 15px;
  font-size: 1.2rem;
`;

const ModalMessage = styled.p`
  margin-bottom: 20px;
  line-height: 1.4;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`;

/* ========================
   FloatingButton を拡張したカスタムボタン群
========================== */
// 送信ボタン（緑） - 元の SendButton は padding: 12px 16px だったのでオーバーライド
const SendFloatingButton = styled(FloatingButton)`
  padding: 12px 16px;
  font-size: 16px;
  background-color: #00b894;
  &:hover {
    background-color: #019875;
  }
`;

// 承認・カード交換・クローズボタン（青） - 元の ActionButton は padding: 8px 14px
const ActionFloatingButton = styled(FloatingButton)`
  padding: 8px 14px;
  font-size: 14px;
  background-color: #3498db;
  &:hover {
    background-color: #2980b9;
  }
`;

// 拒否ボタン（赤）
const RejectFloatingButton = styled(FloatingButton)`
  padding: 8px 14px;
  font-size: 14px;
  background-color: #e74c3c;
  &:hover {
    background-color: #c0392b;
  }
`;

// 削除・キャンセル用（FloatingDangerButton を拡張）
const CustomFloatingDangerButton = styled(FloatingDangerButton)`
  padding: 8px 14px;
  font-size: 14px;
  background-color: #e74c3c;
  &:hover {
    background-color: #c0392b;
  }
`;

// 交換成立ボタン（緑）
const ConfirmFloatingButton = styled(FloatingButton)`
  padding: 8px 14px;
  font-size: 14px;
  background-color: #27ae60;
  &:hover {
    background-color: #1e8e50;
  }
`;

// モーダルのクローズボタン（青）
const CloseFloatingButton = styled(FloatingButton)`
  padding: 8px 14px;
  font-size: 14px;
  background-color: #3498db;
  &:hover {
    background-color: #2980b9;
  }
`;
