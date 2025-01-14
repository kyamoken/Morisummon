import React, { useState } from 'react';
import styled from 'styled-components';

const Battle: React.FC = () => {
  const [turn, setTurn] = useState(1);
  const [playerHP, setPlayerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);

  const handleAction = (action: string) => {
    if (action === 'attack') {
      setOpponentHP(opponentHP - 10);
    } else if (action === 'heal') {
      setPlayerHP(playerHP + 10);
    }
    setTurn(turn + 1);
  };

  return (
    <>
      <div className="global-style" />
      <BattleContainer>
        <OpponentInfo>
          <p>相手の名前: DummyOpponent</p>
          <p>残りHP: {opponentHP}</p>
        </OpponentInfo>
        <TurnInfo>
          <p>現在のターン: {turn}</p>
        </TurnInfo>
        <PlayerInfo>
          <p>自分の名前: DummyPlayer</p>
          <p>残りHP: {playerHP}</p>
        </PlayerInfo>
        <ActionButtons>
          <button onClick={() => handleAction('attack')}>攻撃</button>
          <button onClick={() => handleAction('heal')}>回復</button>
          <button onClick={() => handleAction('defend')}>防御</button>
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
  margin: 20px 0;
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
