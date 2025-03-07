// BattleMainFrame.styles.ts
import styled from 'styled-components';

/**
 * グリッドレイアウト構成はそのままですが、
 * color: #fff を追加し、要素を中央寄せするためのプロパティをいくつか修正しています。
 */
export const BattleContainer = styled.div`
  display: grid;
  grid-template-areas:
    "top"
    "opponent"
    "center"
    "player";
  grid-template-rows: auto 1fr auto auto;
  height: 100vh;

  /* 文字色を白に統一 */
  color: #fff;

  background-color: var(--background-color);
  padding: 20px;
`;

/* ヘッダー部分 */
export const TopBar = styled.div`
  grid-area: top;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  background-color: var(--primary-color);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 10px;
`;

/* ターン情報 */
export const TurnInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

/* 相手情報 */
export const OpponentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
`;

/* 相手フィールドエリア */
export const OpponentFieldArea = styled.div`
  grid-area: opponent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* 中央寄せを追加 */
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: var(--border-radius);
`;

export const FieldTitle = styled.h3`
  margin: 10px 0 5px;
`;

export const BenchArea = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center; /* 中央揃え */
`;

export const BenchSlot = styled.div`
  cursor: pointer;
`;

/* セットアップフェーズ */
export const SetupArea = styled.div`
  grid-area: center;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 10px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: var(--border-radius);
  margin-bottom: 10px;
`;

export const SetupInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const HandContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 10px;
`;

export const SelfFieldArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

/* バトルフェーズ */
export const BattleArea = styled.div`
  grid-area: center;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 10px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: var(--border-radius);
  margin-bottom: 10px;
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
  /* color: #fff;  // Containerで白にしているので、ここは不要 */
`;

/* メインカードエリア */
export const MainArea = styled.div`
  cursor: pointer;
  margin-bottom: 10px;
`;

/* 下部：自分の情報とアクションボタン */
export const PlayerInfoBar = styled.div`
  grid-area: player;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-top: 1px solid rgba(255,255,255,0.2);
`;

export const PlayerInfoBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  button {
    padding: 10px 20px;
    background-color: var(--primary-color);
    color: #fff;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    &:hover {
      background-color: var(--button-hover);
    }
  }
`;

/* カード表示 */
export const Card = styled.div`
  width: 60px;
  height: 90px;
  background-color: #666;
  border: 1px solid #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 5px;
  cursor: pointer;
  transition: transform 0.3s ease;
  &:hover {
    transform: translateY(-5px);
  }
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  span {
    font-size: 0.8rem;
  }
`;

interface HandCardProps {
  selected?: boolean;
}
export const HandCard = styled(Card)<HandCardProps>`
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
  border-radius: var(--border-radius);
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;
