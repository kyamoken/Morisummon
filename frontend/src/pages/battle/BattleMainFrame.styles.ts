import styled from 'styled-components';

/**
 * 大まかに「上部に相手エリア」「下部に自分エリア」を2分割し、
 * グリッド配置するレイアウトです。
 */
export const BattleContainer = styled.div`
  display: grid;
  grid-template-rows: auto 1fr 1fr;
  gap: 10px;
  height: 100vh;
  background-color: var(--background-color);
  color: #fff;
  padding: 10px;
  @media (max-width: 768px) {
    padding: 5px;
  }
`;

/* 相手エリア */
export const OpponentArea = styled.div`
  grid-row: 2;
  display: grid;
  grid-template-areas: "info main bench";
  grid-template-columns: 1fr 1fr 1fr;
  background-color: #8e44ad;
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
`;

export const OpponentInfoArea = styled.div`
  grid-area: info;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const OpponentMainArea = styled.div`
  grid-area: main;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

export const OpponentBenchArea = styled.div`
  grid-area: bench;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`;

/* 自分エリア */
export const PlayerArea = styled.div`
  grid-row: 3;
  display: grid;
  grid-template-areas:
    "hand main info"
    "bench bench bench";
  grid-template-columns: 1fr 1fr 1fr;
  background-color: #5f27cd;
  border-radius: 8px;
  padding: 20px;
  box-sizing: border-box;
`;

export const PlayerBenchArea = styled.div`
  grid-area: bench;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`;

export const PlayerMainArea = styled.div`
  grid-area: main;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

export const PlayerInfoArea = styled.div`
  grid-area: info;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
`;

export const HandArea = styled.div`
  grid-area: hand;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
`;

// 手札のカード群を固定高さのスクロール可能なコンテナに配置する
export const HandAreaScrollContainer = styled.div`
  max-height: 200px; /* 高さは必要に応じて調整 */
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid #ccc;

  /* Chrome, Safari, Opera 用: スクロールバー非表示 */
  &::-webkit-scrollbar {
    display: none;
  }
  /* IE, Edge 用 */
  -ms-overflow-style: none;
  /* Firefox 用 */
  scrollbar-width: none;
`;


export const FieldTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
`;

/* メインカード（サイズ: 120x170） */
export const MainCard = styled.div`
  position: relative;
  width: 120px;
  height: 170px;
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  border-radius: 6px;
  &:hover {
    transform: translateY(-5px);
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  span {
    font-size: 0.8rem;
    margin-top: 4px;
  }
`;

export const MainCardEmptyArea = styled.div`
  position: relative;
  width: 120px;
  height: 170px;
  border: 2px dashed #999;
  border-radius: 6px;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  cursor: pointer;
`;

/* ベンチカード（サイズ: 90x130） */
export const BenchCard = styled.div`
  position: relative;
  width: 90px;
  height: 130px;
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  border-radius: 4px;
  &:hover {
    transform: translateY(-5px);
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  span {
    font-size: 0.75rem;
    margin-top: 2px;
  }
`;

export const BenchCardEmptyArea = styled.div`
  position: relative;
  width: 90px;
  height: 130px;
  border: 2px dashed #999;
  border-radius: 4px;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  cursor: pointer;
`;

export const HandCard = styled.div`
  width: 70px;
  height: 100px;
  background-color: transparent;
  border: 2px solid #fff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  &.selected {
    border-color: #ffd700;
  }
  &:hover {
    transform: translateY(-5px);
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  span {
    font-size: 0.75rem;
    text-align: center;
    padding: 4px;
  }
`;

/* HPゲージ用 */
export const HPGaugeContainer = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 40px;
  height: 14px;
  background-color: #000;
  border: 1px solid #fff;
  border-radius: 2px;
  overflow: hidden;
`;

export const HPGaugeFill = styled.div`
  height: 100%;
  transition: width 0.3s ease;
`;

export const HPGaugeText = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-size: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

/* Energy アイコン表示用 */
export const EnergyIconContainer = styled.div`
  position: absolute;
  bottom: 4px;
  right: 4px;
  display: flex;
  gap: 2px;
`;

export const EnergyIcon = styled.img`
  width: 16px;
  height: 16px;
  object-fit: contain;
`;

/* ボタン関連 */
export const ReadyButton = styled.button`
  margin-top: 5px;
  padding: 6px 12px;
  font-size: 0.9rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
  &:disabled {
    background-color: #999;
    cursor: default;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  button {
    padding: 6px 12px;
    background-color: var(--primary-color);
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    line-height: 1.2;
    white-space: nowrap;
    &:hover {
      opacity: 0.9;
    }
  }
`;
