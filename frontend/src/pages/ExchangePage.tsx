// ExchangePage.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ky } from '@/utils/api';
import Header from '@/components/Header';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-hot-toast';
import ExchangeSuperModal from '@/components/ExchangeSuperModal';
import useAuth from '@/hooks/useAuth';

interface ExchangeData {
  ulid: string;
  status: string;
  proposer_id: number;
  receiver_id: number;
  proposed_card_id: number | null;
}

interface CardData {
  card: {
    id: number;
    name: string;
    image: string;
  };
  amount: number;
}

const ExchangePage: React.FC = () => {
  const { exchange_ulid } = useParams<{ exchange_ulid: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // 認証情報取得
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exchangeData, setExchangeData] = useState<ExchangeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposedCard, setProposedCard] = useState<CardData | null>(null);

  // 交換セッション情報の取得
  const fetchExchangeData = async () => {
    if (!exchange_ulid) return;
    try {
      const data: ExchangeData = await ky
        .get(`/api/exchanges/${exchange_ulid}/`, {
          headers: { Authorization: `Token ${localStorage.getItem('token')}` },
        })
        .json();
      setExchangeData(data);
    } catch (error) {
      console.error('Failed to fetch exchange data:', error);
      toast.error('交換セッション情報の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  // ユーザーのカード一覧の取得
  const fetchUserCards = async () => {
    try {
      const response: CardData[] = await ky
        .get('/api/get-cards/', {
          headers: { Authorization: `Token ${localStorage.getItem('token')}` },
        })
        .json();
      setCards(response);
    } catch (error) {
      console.error('Failed to fetch user cards:', error);
      toast.error('カード情報の取得に失敗しました。');
    }
  };

  // 提案されたカード情報をカード一覧から探す
  const findProposedCard = (cardId: number) => {
    return cards.find((cardData) => cardData.card.id === cardId) || null;
  };

  useEffect(() => {
    fetchExchangeData();
    fetchUserCards();
  }, [exchange_ulid]);

  useEffect(() => {
    if (exchangeData && exchangeData.proposed_card_id && cards.length > 0) {
      const card = findProposedCard(exchangeData.proposed_card_id);
      setProposedCard(card);
    } else {
      setProposedCard(null);
    }
  }, [exchangeData, cards]);

  // 提案側がカードを選択して交換提案を完了する処理（バックエンドで提案時にカード所持数を１減らす）
  const handleProposeExchange = async () => {
    if (!selectedCard || !exchange_ulid) return;
    try {
      await ky.post(`/api/exchanges/${exchange_ulid}/propose/`, {
        json: { card_id: selectedCard.card.id },
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      });
      toast.success('交換提案が完了しました！');
      navigate('/friends');
    } catch (error) {
      console.error('Failed to propose exchange:', error);
      toast.error('交換提案の完了に失敗しました。');
    }
  };

  // 受信側が提案された交換内容を確認して交換成立させる処理（バックエンドで受信者のカード所持数を１増やす）
  const handleConfirmExchange = async () => {
    if (!exchange_ulid) return;
    try {
      await ky.post(`/api/exchanges/${exchange_ulid}/confirm/`, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      });
      toast.success('交換が成立しました！');
      navigate('/friends');
    } catch (error) {
      console.error('Failed to confirm exchange:', error);
      toast.error('交換の成立に失敗しました。');
    }
  };

  // 提案側がキャンセルボタンを押したときの処理（バックエンドでカード所持数を元に戻す）
  const handleCancelExchange = async () => {
    if (!exchange_ulid) return;
    try {
      await ky.post(`/api/exchanges/${exchange_ulid}/cancel/`, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      });
      toast.success('交換がキャンセルされました！');
      navigate('/friends');
    } catch (error) {
      console.error('Failed to cancel exchange:', error);
      toast.error('交換のキャンセルに失敗しました。');
    }
  };

  // カードクリック時の処理
  const handleCardClick = (card: CardData) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  if (loading) return <div>Loading...</div>;

  // 現在のユーザーID
  const currentUserId = user?.id;

  return (
    <Container>
      <Header />
      <Content>
        {exchangeData && (exchangeData.status === 'pending' || exchangeData.status === 'proposed') ? (
          // まだカードが提案されていない場合はカード選択画面
          exchangeData.proposed_card_id === null ? (
            <>
              <Title>交換するカードを選択してください</Title>
              <CardGrid>
                {cards.map((cardData) => (
                  <CardItem key={cardData.card.id} onClick={() => handleCardClick(cardData)}>
                    <CardImage src={cardData.card.image} alt={cardData.card.name} />
                    <CardName>{cardData.card.name}</CardName>
                  </CardItem>
                ))}
              </CardGrid>
            </>
          ) :
          // すでに提案済みの場合
          currentUserId && exchangeData.proposer_id === currentUserId ? (
            <>
              <Title>あなたが提案したカード</Title>
              {proposedCard ? (
                <ProposedCardContainer>
                  <CardImage src={proposedCard.card.image} alt={proposedCard.card.name} />
                  <CardName>{proposedCard.card.name}</CardName>
                </ProposedCardContainer>
              ) : (
                <Message>提案されたカード情報はありません。</Message>
              )}
              <ButtonGroup>
                <CancelExchangeButton onClick={handleCancelExchange}>キャンセル</CancelExchangeButton>
              </ButtonGroup>
            </>
          ) : (
            <>
              <Title>相手がカード交換を提案しています！</Title>
              {proposedCard ? (
                <ProposedCardContainer>
                  <CardImage src={proposedCard.card.image} alt={proposedCard.card.name} />
                  <CardName>{proposedCard.card.name}</CardName>
                </ProposedCardContainer>
              ) : (
                <Message>提案されたカード情報はありません。</Message>
              )}
              <Message>内容に問題なければ「交換成立」ボタンを押してください。</Message>
              <ConfirmExchangeButton onClick={handleConfirmExchange}>
                交換成立
              </ConfirmExchangeButton>
            </>
          )
        ) : (
          <Title>有効な交換セッションがありません</Title>
        )}
      </Content>
      {/* カード選択確認用モーダル */}
      {isModalOpen && selectedCard && (
        <ExchangeSuperModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalContent>
            <ModalTitle>{selectedCard.card.name}</ModalTitle>
            <ModalMessage>このカードを交換に出しますか？</ModalMessage>
            <ButtonGroup>
              <ConfirmButton onClick={handleProposeExchange}>はい</ConfirmButton>
              <CancelButton onClick={() => setIsModalOpen(false)}>いいえ</CancelButton>
            </ButtonGroup>
          </ModalContent>
        </ExchangeSuperModal>
      )}
    </Container>
  );
};

export default ExchangePage;

/* styled-components の例 */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-color);
  color: white;
`;

const Content = styled.div`
  padding: 20px;
  flex: 1;
  text-align: center;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

const Message = styled.p`
  margin-bottom: 20px;
  font-size: 16px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 20px;
`;

const CardItem = styled.div`
  cursor: pointer;
  text-align: center;
  &:hover {
    opacity: 0.8;
  }
`;

const CardImage = styled.img`
  width: 100%;
  border-radius: var(--border-radius);
`;

const CardName = styled.p`
  margin-top: 10px;
  font-size: 14px;
`;

// 提案されたカード表示の領域（幅固定）
const ProposedCardContainer = styled.div`
  display: inline-block;
  margin-bottom: 20px;
  border: 2px solid var(--primary-color);
  padding: 10px;
  border-radius: var(--border-radius);
  width: 150px;
  text-align: center;
`;

const ModalContent = styled.div`
  padding: 20px;
  background-color: var(--modal-background-default);
  border-radius: 10px;
  text-align: center;
`;

const ModalTitle = styled.h2`
  margin-bottom: 15px;
`;

const ModalMessage = styled.p`
  margin-bottom: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
`;

const ConfirmButton = styled.button`
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 10px 20px;
  cursor: pointer;
`;

const CancelButton = styled.button`
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 10px 20px;
  cursor: pointer;
`;

const ConfirmExchangeButton = styled(ConfirmButton)`
  margin-top: 30px;
`;

const CancelExchangeButton = styled(CancelButton)`
  margin-top: 30px;
`;
