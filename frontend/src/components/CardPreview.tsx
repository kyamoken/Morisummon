// components/CardPreview.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ky } from '@/utils/api';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Card {
  id: number;
  name: string;
  image: string;
  hp: number;
  attack: number;
}

const isCard = (arg: any): arg is Card => {
  return arg.id !== undefined && arg.name !== undefined;
};

interface CardPreviewProps {
  cardId: number;
}

const PreviewContainer = styled.div`
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  max-width: 200px;
  text-align: center;
`;

const CardImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 4px;
`;

const CardName = styled.h3`
  margin-top: 8px;
  font-size: 16px;
`;

const CardStats = styled.div`
  margin-top: 8px;
  font-size: 14px;
`;

const CardPreview: React.FC<CardPreviewProps> = ({ cardId }) => {
  const [card, setCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        const response = await ky.get(`/api/cards/${cardId}/`, {
          headers: { Authorization: `Token ${localStorage.getItem('token')}` },
        }).json();
        if (isCard(response)) {
          setCard(response);
        } else {
          console.error('Invalid card data:', response);
        }
      } catch (error) {
        console.error('Failed to fetch card details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCardDetails();
  }, [cardId]);

  if (isLoading) {
    return <LoadingSpinner size="small" />;
  }

  if (!card) {
    return <p>カード情報を取得できませんでした。</p>;
  }

  return (
    <PreviewContainer>
      <CardImage src={card.image} alt={card.name} />
      <CardName>{card.name}</CardName>
      <CardStats>
        <p>HP: {card.hp}</p>
        <p>攻撃力: {card.attack}</p>
      </CardStats>
    </PreviewContainer>
  );
};

export default CardPreview;
