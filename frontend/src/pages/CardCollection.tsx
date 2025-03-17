import React, { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import Header from '@/components/Header';
import useCardManager from '@/hooks/useCardManager';
import type { Card } from '@/types/models';
import BubblesBackground from '@/components/BubblesBackground';
import { toHiragana } from 'wanakana';

const attributeOptions = [
  { value: "All", label: "全て" },
  { value: "fire", label: "火" },
  { value: "water", label: "水" },
  { value: "thunder", label: "雷" },
  { value: "wind", label: "風" },
  { value: "earth", label: "土" },
  { value: "ice", label: "氷" },
  { value: "dark", label: "闇" },
  { value: "light", label: "光" },
];

const CardCollection: React.FC = () => {
  const { cards, isLoading } = useCardManager();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedAttribute, setSelectedAttribute] = useState<string>("All");
  const [selectedPackFilter, setSelectedPackFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleCardClick = (card: Card): void => {
    setSelectedCard(card);
  };

  const handleCloseModal = (): void => {
    setSelectedCard(null);
  };

  // ユニークなパックオプションを計算
  const packOptions = useMemo(() => {
    if (!cards) return [{ value: "All", label: "全て" }];
    const uniquePacks = Array.from(
      new Set(cards.map(({ card }) => card.pack).filter(Boolean))
    );
    return [
      { value: "All", label: "全て" },
      ...uniquePacks.map((pack) => ({ value: pack, label: pack })),
    ];
  }, [cards]);

  // フィルタ処理
  const filteredCards = useMemo(() => {
    if (!cards) return [];
    return cards.filter(({ card }) => {
      const matchAttribute = selectedAttribute === "All" || card.type === selectedAttribute;
      const matchPack = selectedPackFilter === "All" || card.pack === selectedPackFilter;
      // ひらがなに変換して部分一致判定
      const normalizedCardName = toHiragana(card.name, {
        convertLongVowelMark: false
      });
      const normalizedSearchTerm = toHiragana(searchTerm.trim(), {
        convertLongVowelMark: false
      });
      console.log(normalizedCardName, normalizedSearchTerm);
      const matchName =
        normalizedSearchTerm === "" || normalizedCardName.includes(normalizedSearchTerm);
      return matchAttribute && matchPack && matchName;
    });
  }, [cards, selectedAttribute, selectedPackFilter, searchTerm]);

  return (
    <CardCollectionContainer>
      <BubblesBackground />
      <Header />
      <Content>
        <Title>カード図鑑</Title>
        <FilterContainer>
          <FilterGroup>
            <FilterLabel>属性で絞り込み:</FilterLabel>
            <FilterSelect
              value={selectedAttribute}
              onChange={(e) => setSelectedAttribute(e.target.value)}
            >
              {attributeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>パックで絞り込み:</FilterLabel>
            <FilterSelect
              value={selectedPackFilter}
              onChange={(e) => setSelectedPackFilter(e.target.value)}
            >
              {packOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>名前で検索:</FilterLabel>
            <SearchInput
              type="text"
              placeholder="カード名を検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FilterGroup>
        </FilterContainer>
        <CardGrid>
          {isLoading ? (
            <LoadingWrapper>
              <LoadingSpinner />
            </LoadingWrapper>
          ) : filteredCards.length ? (
            filteredCards.map(({ card }) => (
              <CardSlot key={card.id} onClick={() => handleCardClick(card)}>
                {card.image ? (
                  <CardImage src={card.image} alt={card.name} />
                ) : (
                  <CardPlaceholder>{card.name}</CardPlaceholder>
                )}
              </CardSlot>
            ))
          ) : (
            <NoCardsMessage>該当するカードが存在しません...</NoCardsMessage>
          )}
        </CardGrid>
      </Content>
      {selectedCard ? <ModalOverlay onClick={handleCloseModal}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ExpandedCardImage
            src={selectedCard.image || ''}
            alt={selectedCard.name}
          />
          <CloseButton onClick={handleCloseModal}>×</CloseButton>
        </ModalContent>
      </ModalOverlay> : null}
    </CardCollectionContainer>
  );
};

export default CardCollection;

/* スタイル定義 */
const CardCollectionContainer = styled.div`
  position: relative;
  min-height: 100vh;
  background: linear-gradient(270deg, #383875, #6f6fa8, #383875);
  background-size: 600% 600%;
  color: #fff;
  padding: 80px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  animation: gradientAnimation 15s ease infinite;

  @keyframes gradientAnimation {
    0% {
      background-position: 0 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 40px;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const FilterLabel = styled.label`
  margin-bottom: 8px;
  font-size: 1rem;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
  color: #333;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 200px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
`;

const CardSlot = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const CardPlaceholder = styled.div`
  padding: 20px;
  text-align: center;
  font-size: 1rem;
  color: #bbb;
`;

const NoCardsMessage = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #fff;
  grid-column: 1 / -1;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
`;

const ModalContent = styled.div`
  position: relative;
  background: #c0c0c0;
  border: 10px solid #646464;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ExpandedCardImage = styled.img`
  width: 300px;
  height: 450px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #1d1631;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;

  &:hover {
    background: #190b2f;
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
`;

const LoadingSpinner = styled.div`
  border: 8px solid rgba(255, 255, 255, 0.3);
  border-top: 8px solid #fff;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${rotate} 1s linear infinite;
`;
