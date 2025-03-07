// BattleMainFrame.styles.ts
import styled from 'styled-components';

export const BattleContainer = styled.div`
  display: grid;
  grid-template-areas:
    "opponent-info turn-info"
    "field field"
    "player-info action-buttons";
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto;
  height: 100vh;
  background-color: var(--background-color);
  color: white;
  padding: 20px;
`;

/* 上部バー */
export const TopBar = styled.div`
  grid-area: turn-info;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

/* ターン情報 */
export const TurnInfo = styled.div`
  text-align: left;
`;

/* 相手情報 */
export const OpponentInfo = styled.div`
  grid-area: opponent-info;
  text-align: right;
`;

/* 相手のフィールド */
export const OpponentFieldArea = styled.div`
  grid-area: field;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;

export const FieldTitle = styled.h3`
  margin: 10px 0 5px;
`;

export const BenchArea = styled.div`
  display: flex;
  gap: 10px;
`;

export const BenchSlot = styled.div`
  cursor: pointer;
`;

/* セットアップエリア */
export const SetupArea = styled.div`
  grid-area: field;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
`;

export const SetupInfo = styled.div`
  flex: 1;
  text-align: center;
`;

export const HandContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin: 10px 0;
`;

export const SelfFieldArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

/* バトルエリア（セットアップ終了後） */
export const BattleArea = styled.div`
  grid-area: field;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
`;

export const HandSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const HandTitle = styled.h3`
  margin: 0;
  padding: 0.5rem;
  font-size: 1.5rem;
  color: var(--text-color);
`;

/* 自分のメインエリア */
export const MainArea = styled.div`
  cursor: pointer;
`;

/* プレイヤー情報とアクションボタン */
export const PlayerInfoBar = styled.div`
  grid-area: player-info;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

export const PlayerInfoBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

/* ボタンエリア */
export const ActionButtons = styled.div`
  grid-area: action-buttons;
  text-align: right;
  button {
    margin: 0 5px;
  }
`;

/* カード・手札関連 */
export const Card = styled.div`
  width: 50px;
  height: 70px;
  background-color: #666;
  border: 1px solid #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 5px;
  cursor: pointer;
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

interface HandCardProps {
  selected?: boolean;
}

export const HandCard = styled(Card)<HandCardProps>`
  width: 60px;
  height: 90px;
  font-size: 0.8rem;
  border: 2px solid ${(props) => (props.selected ? '#FFD700' : '#fff')};
`;

export const EmptyArea = styled.div`
  width: 60px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #999;
  color: #999;
`;

export const ReadyButton = styled.button`
  margin-top: 15px;
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;
