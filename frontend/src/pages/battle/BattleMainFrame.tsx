import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Matching from './Matching';
import Disconnected from './Disconnected';
import toast from 'react-hot-toast';
import { WebSocketHook } from 'react-use-websocket/dist/lib/types';
// import PlayerTurnOverlay from './PlayerTurnOverlay';

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
  status: "progress" | "waiting";
  turn: number;
  turn_player_id: string;
  you: { info: PlayerInfo, status: PlayerStatus };
  opponent?: { info: PlayerInfo, status: PlayerStatus };
}

type WebSocketMessage = {
  type: "battle.update";
  data: BattleDetails;
} | {
  type: "battle.turn.change";
  target: "player" | "opponent";
  // data: BattleDetails;
} | {
  type: "chat.message";
  user: {
    name: string;
  };
  message: string;
} | {
  type: "error";
  message: string;
} | {
  type: "warning";
  message: string;
};

const handleWindowUnload = (e: BeforeUnloadEvent) => {
  e.preventDefault();
};

type Props = {
  websocket: WebSocketHook<WebSocketMessage>;
}

const BattleMainFrame = ({ websocket }: Props) => {
  const { sendJsonMessage, lastJsonMessage, readyState, getWebSocket } = websocket;

  const [battleDetails, setBattleDetails] = useState<BattleDetails | null>(null);

  useEffect(() => {
    window.addEventListener('beforeunload', handleWindowUnload);

    return () => {
      window.removeEventListener('beforeunload', handleWindowUnload);
    };
  }, []);

  useEffect(() => {
    if (battleDetails?.status !== 'progress') {
      return;
    }

    if (battleDetails?.turn_player_id === battleDetails?.you.info._id) {
      toast(`あなたのターンです`, {
        icon: '🔥'
      });
    } else {
      toast(`相手のターンです`, {
        icon: '🔥'
      });
    }
  }, [battleDetails?.status, battleDetails?.turn_player_id]);

  useEffect(() => {
    const handlerMap: { [K in WebSocketMessage['type']]?: (data: Extract<WebSocketMessage, { type: K }>) => void } = {
      'battle.update': (data) => {
        setBattleDetails(data.data);
      },
      'chat.message': (data) => {
        toast((
          <div>
            <div>{data.message}</div>
            <div style={{ fontSize: "80%", color: "gray", textAlign: "right" }}>By {data.user?.name}</div>
          </div>
        ), {
          icon: '💬'
        });
      },
      'error': (data: any) => {
        toast.error(data.message);
        getWebSocket()?.close();
      },
      'warning': (data: any) => {
        toast(data.message, {
          icon: '⚠️'
        });
      }
    };

    if (lastJsonMessage?.type && handlerMap[lastJsonMessage.type]) {
      handlerMap[lastJsonMessage.type]?.(lastJsonMessage as any);
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

  const handleCommand = () => {
    const cmd = window.prompt('Command?');
    if (cmd?.startsWith('{')) {
      try {
        const parsed = JSON.parse(cmd);
        sendJsonMessage(parsed);
      } catch (e) {
        console.error(e);
        return;
      }
      return;
    }

    sendJsonMessage({ type: cmd });
  };

  return (
    <>
      <div className="global-style" />
      <div style={{ position: "fixed", top: "10px", right: "10px", fontSize: "80%" }}>
        {JSON.stringify(battleDetails)}
      </div>
      <BattleContainer>
        <OpponentInfo>
          <p>相手の名前: {battleDetails?.opponent.info?.name}</p>
          <p>残りHP: {battleDetails?.opponent.status.life}</p>
        </OpponentInfo>
        <TurnInfo>
          <p>プレイヤー: {battleDetails?.turn_player_id}</p>
        </TurnInfo>
        <PlayerInfo>
          <p>自分の名前: {battleDetails?.you.info?.name}</p>
          <p>残りHP: {battleDetails?.you.status.life}</p>
        </PlayerInfo>
        <ActionButtons>
          <button onClick={handleCommand}>Cmd</button>
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

export default BattleMainFrame;
