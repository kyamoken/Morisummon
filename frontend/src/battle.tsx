import React from 'react';
import styled from 'styled-components';
import './GlobalStyle.css';

const Battle: React.FC = () => {
  return (
    <>
      <div className="global-style" />
      <BattleContainer>
        <OpponentInfo>
          <p>相手の名前: DummyOpponent</p>
          <p>残りHP: 100</p>
        </OpponentInfo>
        <TurnInfo>
          <p>現在のターン: 1</p>
        </TurnInfo>
        <PlayerInfo>
          <p>自分の名前: DummyPlayer</p>
          <p>残りHP: 100</p>
        </PlayerInfo>
        <ActionButtons>
          <button>ボタン1</button>
          <button>ボタン2</button>
          <button>ボタン3</button>
        </ActionButtons>
        <HandCards>
          <p>手札: カード1, カード2, カード3</p>
        </HandCards>
        <BattleArea>
          <Bench>
            <Card>□</Card>
            <Card>□</Card>
            <Card>□</Card>
          </Bench>
          <MainArea>
            <Card className="empty"></Card>
            <Card>□</Card>
            <Card className="empty"></Card>
          </MainArea>
          <MainArea>
            <Card className="empty"></Card>
            <Card>□</Card>
            <Card className="empty"></Card>
          </MainArea>
          <Bench>
            <Card>□</Card>
            <Card>□</Card>
            <Card>□</Card>
          </Bench>
        </BattleArea>
      </BattleContainer>
    </>
  );
};

const BattleContainer = styled.div`
  display: grid;
  grid-template-areas:
    "opponent-info turn-info"
    "battle-area battle-area"
    "player-info action-buttons"
    "hand-cards hand-cards";
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr auto auto;
  height: 100vh;
  background-color: var(--background-color);
  color: white;
  padding: 20px;
`;

const OpponentInfo = styled.div`
  grid-area: opponent-info;
  align-self: start;
`;

const TurnInfo = styled.div`
  grid-area: turn-info;
  align-self: start;
  text-align: right;
`;

const PlayerInfo = styled.div`
  grid-area: player-info;
  align-self: end;
`;

const ActionButtons = styled.div`
  grid-area: action-buttons;
  align-self: end;
  text-align: right;

  button {
    margin: 0 5px;
  }
`;

const HandCards = styled.div`
  grid-area: hand-cards;
  align-self: end;
  text-align: center;
`;

const BattleArea = styled.div`
  grid-area: battle-area;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Bench = styled.div`
  display: flex;
  justify-content: center;
  margin: 10px 0;
`;

const MainArea = styled.div`
  display: flex;
  justify-content: center;
  margin: 10px 0;
`;

const Card = styled.div`
  width: 50px;
  height: 70px;
  background-color: #666;
  border: 1px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 5px;

  &.empty {
    background-color: transparent;
    border: none;
  }
`;

export default Battle;
