// ExchangePage.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ky } from '@/utils/api';
import Header from '@/components/Header';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-hot-toast'; // モーダル用コンポーネント（任意実装）
import ExchangeSuperModal from '@/components/ExchangeSuperModal' ;
interface CardData {
  card: {
    id: number;
    name: string;
    image: string; // 画像URL（CardSerializer に image フィールドがある前提）
    // その他必要なフィールド
  };
  amount: number;
}

const ExchangePage: React.FC = () => {
  const { exchange_ulid } = useParams<{ exchange_ulid: string }>();
  const navigate = useNavigate();
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ユーザーのカードを取得
  const fetchUserCards = async () => {
    try {
      const response: CardData[] = await ky.get('/api/get-cards/', {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      }).json();
      setCards(response);
    } catch (error) {
      console.error('Failed to fetch user cards:', error);
      toast.error('カード情報の取得に失敗しました。');
    }
  };

  useEffect(() => {
    fetchUserCards();
  }, []);

  // カードをクリック時の処理
  const handleCardClick = (card: CardData) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  // モーダルの「はい」を押した場合：交換提案を完了する
  const handleConfirmExchange = async () => {
    if (!selectedCard || !exchange_ulid) return;
    try {
      await ky.post(`/api/exchanges/${exchange_ulid}/propose/`, {
        json: { card_id: selectedCard.card.id },
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      });
      toast.success('交換提案が完了しました！');
      navigate('/friends'); // フレンドページへ戻る
    } catch (error) {
      console.error('Failed to propose exchange:', error);
      toast.error('交換提案の完了に失敗しました。');
    }
  };

  return (
    <Container>
      <Header />
      <Content>
        <Title>交換するカードを選択</Title>
        <CardGrid>
          {cards.map((cardData) => (
            <CardItem key={cardData.card.id} onClick={() => handleCardClick(cardData)}>
              <CardImage src={cardData.card.image} alt={cardData.card.name} />
              <CardName>{cardData.card.name}</CardName>
            </CardItem>
          ))}
        </CardGrid>
      </Content>
      {isModalOpen && selectedCard && (
          <ExchangeSuperModal onClose={() => setIsModalOpen(false)}>
            <ModalContent>
              <ModalTitle>{selectedCard.card.name}</ModalTitle>
              <ModalMessage>このカードを交換に出しますか？</ModalMessage>
              <ButtonGroup>
                <ConfirmButton onClick={handleConfirmExchange}>はい</ConfirmButton>
                <CancelButton onClick={() => setIsModalOpen(false)}>いいえ</CancelButton>
              </ButtonGroup>
            </ModalContent>
          </ExchangeSuperModal>
        )}
    </Container>
  );
};

export default ExchangePage;

// styled-components の例
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
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
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
