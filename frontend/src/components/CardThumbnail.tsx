// components/CardThumbnail.tsx
import React from 'react';
import styled from 'styled-components';

interface Card {
  id: number;
  name: string;
  image: string;
}

interface CardThumbnailProps {
  card: Card;
  onSelect: () => void;
  isSelected: boolean;
}

const ThumbnailContainer = styled.div<{ isSelected: boolean }>`
  border: 2px solid ${(props) => (props.isSelected ? 'var(--primary-color)' : '#ccc')};
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: border-color 0.3s ease;
  text-align: center;

  &:hover {
    border-color: var(--primary-color);
  }
`;

const CardImage = styled.img`
  width: 100px;
  height: 140px;
  object-fit: cover;
  border-radius: 4px;
`;

const CardName = styled.p`
  margin-top: 8px;
  font-size: 14px;
`;

const CardThumbnail: React.FC<CardThumbnailProps> = ({ card, onSelect, isSelected }) => {
  return (
    <ThumbnailContainer isSelected={isSelected} onClick={onSelect}>
      <CardImage src={card.image} alt={card.name} />
      <CardName>{card.name}</CardName>
    </ThumbnailContainer>
  );
};

export default CardThumbnail;
