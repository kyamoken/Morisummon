import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import styled from 'styled-components';
import { ky } from '@/utils/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import CardThumbnail from '@/components/CardThumbnail';
import CardPreview from '@/components/CardPreview';

const ExchangePage: React.FC = () => {
  const { exchangeId } = useParams<{ exchangeId: string }>();
  const [exchange, setExchange] = useState<any>(null);
  const [userCards, setUserCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [opponentCard, setOpponentCard] = useState<number | null>(null);
  const [status, setStatus] = useState<'waiting' | 'selecting' | 'confirmed' | 'completed'>('waiting');
  const [isLoading, setIsLoading] = useState(true);

  // 交換の詳細情報を取得
  const fetchExchangeDetails = async () => {
    try {
      const response = await ky
        .get(`/api/exchanges/${exchangeId}/`, {
          headers: { Authorization: `Token ${localStorage.getItem('token')}` },
        })
        .json();
      setExchange(response);
      setStatus(response.status);
      setSelectedCard(response.initiator_card);
      setOpponentCard(response.receiver_card);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('交換が見つかりません');
      } else {
        console.error('Failed to fetch exchange details:', error);
        toast.error('交換情報の取得に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

const fetchUserCards = async () => {
  try {
    const response = await ky
      .get('/api/get-cards/', {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      })
      .json();
    setUserCards(response.cards);
  } catch (error: any) {
    console.error('Failed to fetch user cards:', error);
    toast.error('カード一覧の取得に失敗しました');
  }
};

  // カードを選択
  const handleCardSelect = async (cardId: number) => {
    try {
      await ky.post(
        `/api/exchanges/${exchangeId}/select_card/`,
        {
          json: { card_id: cardId },
          headers: { Authorization: `Token ${localStorage.getItem('token')}` },
        }
      );
      setSelectedCard(cardId);
      toast.success('カードを選択しました');
    } catch (error: any) {
      console.error('Failed to select card:', error);
      toast.error('カードの選択に失敗しました');
    }
  };

  // 交換を確定
  const handleConfirmExchange = async () => {
    try {
      await ky.post(
        `/api/exchanges/${exchangeId}/confirm/`,
        {
          headers: { Authorization: `Token ${localStorage.getItem('token')}` },
        }
      );
      toast.success('交換が確定しました');
      setStatus('completed');
    } catch (error: any) {
      console.error('Failed to confirm exchange:', error);
      toast.error('交換の確定に失敗しました');
    }
  };

  useEffect(() => {
    fetchExchangeDetails();
    fetchUserCards();
  }, [exchangeId]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ExchangeContainer>
      <h1>カード交換</h1>

      {status === 'waiting' && (
        <p>相手の参加を待っています...</p>
      )}

      {status === 'selecting' && (
        <CardSelection>
          <h2>交換するカードを選択</h2>
          <CardGrid>
            {userCards.map((card) => (
              <CardThumbnail
                key={card.id}
                card={card}
                onSelect={() => handleCardSelect(card.id)}
                isSelected={selectedCard === card.id}
              />
            ))}
          </CardGrid>
        </CardSelection>
      )}

      {opponentCard && (
        <OpponentSelection>
          <h2>相手が選択したカード</h2>
          <CardPreview cardId={opponentCard} />
        </OpponentSelection>
      )}

      {status === 'selecting' && selectedCard && opponentCard && (
        <ConfirmButton onClick={handleConfirmExchange}>交換を確定</ConfirmButton>
      )}

      {status === 'completed' && (
        <p>交換が完了しました！</p>
      )}
    </ExchangeContainer>
  );
};

// スタイル定義
const ExchangeContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const CardSelection = styled.div`
  margin-top: 20px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 10px;
`;

const OpponentSelection = styled.div`
  margin-top: 20px;
`;

const ConfirmButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--button-hover);
  }
`;

export default ExchangePage;
