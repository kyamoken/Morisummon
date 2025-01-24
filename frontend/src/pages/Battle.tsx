import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Matching from './battle/Matching';
import Disconnected from './battle/Disconnected';
import toast from 'react-hot-toast';

type PlayerInfo = {
  _id: string;
  name: string;
  avatar: number;
}

type PlayerStatus = {
  life: number;
  battle_card: any;
  bench_cards: any[];
}

type BattleDetails = {
  status: "playing" | "waiting";
  turn: number;
  you: { info: PlayerInfo, status: PlayerStatus };
  opponent?: { info: PlayerInfo, status: PlayerStatus };
}

type WebSocketMessage = {
  type: "battle.update";
  data: BattleDetails;
} | {
  type: "chat.message";
  user: {
    name: string;
  };
  message: string;
} | {
  type: "error";
  message: string;
};


const Battle: React.FC = () => {
  const [socketUrl, setSocketUrl] = useState('/ws/battle/room/main/');
  const { sendJsonMessage, lastJsonMessage, readyState, getWebSocket } = useWebSocket<WebSocketMessage>(socketUrl);
  const [battleDetails, setBattleDetails] = useState<BattleDetails | null>(null);

  useEffect(() => {
    if (lastJsonMessage?.type === 'battle.update') {
      setBattleDetails(lastJsonMessage.data);
      console.log('Battle details:', lastJsonMessage.data);
      console.log(`${lastJsonMessage.data.you.info._id} vs ${lastJsonMessage.data.opponent?.info._id}`);
    } else if (lastJsonMessage?.type === 'error') {
      toast.error(lastJsonMessage.message);
      getWebSocket()?.close();
    } else if (lastJsonMessage?.type === 'chat.message') {
      toast((
        <div>
          <div>{lastJsonMessage.message}</div>
          <div style={{ fontSize: "80%", color: "gray", textAlign: "right" }}>By {lastJsonMessage.user?.name}</div>
        </div>
      ), {
        icon: '💬'
      });
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (lastJsonMessage) {
      console.log('Message received:', lastJsonMessage);
    }
  }, [lastJsonMessage]);

  if (readyState === ReadyState.CONNECTING) {
    return (
      <Matching message="サーバーに接続中..." />
    );
  }

  if (readyState !== ReadyState.OPEN) {
    return (
      <Disconnected message="切断されました" />
    );
  }

  if (lastJsonMessage === null || battleDetails?.status === 'waiting' || !battleDetails?.opponent) {
    return (
      <Matching message="対戦相手をさがしています..." />
    );
  }

  const sendMessage = (message: string) => {
    sendJsonMessage({
      type: 'chat.message',
      message
    });
  };

  const handleAction = (action: string) => {
    sendJsonMessage({ action });
  };

  return (
    <>
      <div className="global-style" />
      <BattleContainer>
        <OpponentInfo>
          <p>相手の名前: {battleDetails?.opponent.info?.name}</p>
          <p>残りHP: {battleDetails?.opponent.status.life}</p>
        </OpponentInfo>
        <TurnInfo>
          <p>現在のターン: {battleDetails?.status}</p>
        </TurnInfo>
        <PlayerInfo>
          <p>自分の名前: {battleDetails?.you.info?.name}</p>
          <p>残りHP: {battleDetails?.you.status.life}</p>
        </PlayerInfo>
        <ActionButtons>
          <button onClick={() => sendMessage('こんにちは')}>Hello</button>
          <button onClick={() => handleAction('defend')}>防御</button>
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
