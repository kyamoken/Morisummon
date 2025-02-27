import React from 'react';
import styled from 'styled-components';

export type ModalMode = "actionSelect" | "targetSelect";

export type CardInfo = {
  id: string;
  name?: string;
  image?: string;
  energy?: number;
  hp?: number;
  placeholder?: string;
};

type CardActionModalProps = {
  visible: boolean;
  mode: ModalMode;
  selectedAction: "attack" | "retreat" | null;
  card: CardInfo | null;
  opponentTargets: CardInfo[];
  benchTargets: CardInfo[];
  onActionSelect: (action: "attack" | "retreat") => void;
  onTargetSelect: (target: { id?: string; benchIndex?: number }) => void;
  onClose: () => void;
};

const CardActionModal: React.FC<CardActionModalProps> = ({
  visible,
  mode,
  selectedAction,
  card,
  opponentTargets,
  benchTargets,
  onActionSelect,
  onTargetSelect,
  onClose,
}) => {
  if (!visible || !card) return null;
  return (
    <ModalOverlay>
      <ModalContent>
        <EnlargedCard>
          {card.image ? <img src={card.image} alt={card.name} /> : <div>画像なし</div>}
        </EnlargedCard>
        {mode === "actionSelect" && (
          <ModalButtons>
            <ModalButton onClick={() => onActionSelect("attack")}>攻撃</ModalButton>
            <ModalButton onClick={() => onActionSelect("retreat")}>逃げる</ModalButton>
          </ModalButtons>
        )}
        {mode === "targetSelect" && selectedAction === "attack" && (
          <div>
            <ModalHeader>どのカードを攻撃しますか？</ModalHeader>
            <TargetContainer>
              {opponentTargets.map((targetCard, idx) => (
                <TargetCard key={idx} onClick={() => onTargetSelect({ id: idx.toString() })}>
                  {targetCard.image ? (
                    <img src={targetCard.image} alt={targetCard.name} />
                  ) : (
                    <div>画像なし</div>
                  )}
                </TargetCard>
              ))}
            </TargetContainer>
          </div>
        )}
        {mode === "targetSelect" && selectedAction === "retreat" && (
          <div>
            <ModalHeader>どのカードと入れ替えますか？</ModalHeader>
            <TargetContainer>
              {benchTargets.map((bCard, idx) => (
                <TargetCard key={idx} onClick={() => onTargetSelect({ benchIndex: idx })}>
                  {bCard.image ? (
                    <img src={bCard.image} alt={bCard.name} />
                  ) : (
                    <div>画像なし</div>
                  )}
                </TargetCard>
              ))}
            </TargetContainer>
          </div>
        )}
        <CloseButton onClick={onClose}>閉じる</CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  min-width: 300px;
`;

const EnlargedCard = styled.div`
  width: 200px;
  height: 280px;
  margin-bottom: 20px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const ModalHeader = styled.h3`
  margin-bottom: 10px;
`;

const TargetContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
`;

const TargetCard = styled.div`
  width: 80px;
  height: 110px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px;
  cursor: pointer;
  img {
    width: 100%;
    height: 70px;
    object-fit: contain;
  }
`;

const CloseButton = styled.button`
  padding: 5px 10px;
  font-size: 0.8rem;
  background: gray;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

export default CardActionModal;
