import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Matching from './Matching';
import Disconnected from './Disconnected';
import toast from 'react-hot-toast';
import { WebSocketHook } from 'react-use-websocket/dist/lib/types';
import BattleTurnEndModal from '@/components/BattleComponents/battleTurnEndModal';
import PlayerTurnOverlay from './PlayerTurnOverlay';

// サーバーから受信するバトル状態の型
type PlayerInfo = {
  _id: string;
  name: string;
  avatar: number;
};

type CardInfo = {
  id: string;
  energy?: number; // サーバー側で管理されるカードごとのエネルギー
  // 他のプロパティも必要に応じて追加
};

type PlayerStatus = {
  life: number;
  // アクティブなバトルカード（メインエリアで利用するカード）
  battle_card: CardInfo | null;
  // ベンチにあるカード群
  bench_cards: CardInfo[];
  // プレイヤーが現在利用可能なエネルギー
  energy: number;
};

type BattleDetails = {
  status: "progress" | "waiting";
  turn: number;
  turn_player_id: string;
  you: { info: PlayerInfo; status: PlayerStatus };
  opponent?: { info: PlayerInfo; status: PlayerStatus };
};

type WebSocketMessage =
  | {
      type: "battle.update";
      data: BattleDetails;
    }
  | {
      type: "battle.turn.change";
      target: "player" | "opponent";
    }
  | {
      type: "chat.message";
      user: { name: string };
      message: string;
    }
  | {
      type: "error";
      message: string;
    }
  | {
      type: "warning";
      message: string;
    };

const handleWindowUnload = (e: BeforeUnloadEvent) => {
  e.preventDefault();
};

type Props = {
  websocket: WebSocketHook<WebSocketMessage>;
};

const BattleMainFrame = ({ websocket }: Props) => {
  const { sendJsonMessage, lastJsonMessage, readyState, getWebSocket } = websocket;
  const [battleDetails, setBattleDetails] = useState<BattleDetails | null>(null);
  const [isTurnEndModalOpen, setIsTurnEndModalOpen] = useState(false);
  // 追加: ターンチェンジ時の通知用の状態。 "player" / "opponent" / null
  const [turnOwner, setTurnOwner] = useState<"player" | "opponent" | null>(null);

  useEffect(() => {
    window.addEventListener('beforeunload', handleWindowUnload);
    return () => {
      window.removeEventListener('beforeunload', handleWindowUnload);
    };
  }, []);

  // サーバーから受信したバトル状態を反映
  useEffect(() => {
    const handlerMap: {
      [K in WebSocketMessage['type']]?: (data: Extract<WebSocketMessage, { type: K }>) => void;
    } = {
      'battle.update': (data) => {
        setBattleDetails(data.data);
      },
      'chat.message': (data) => {
        toast(
          <div>
            <div>{data.message}</div>
            <div style={{ fontSize: "80%", color: "gray", textAlign: "right" }}>
              By {data.user?.name}
            </div>
          </div>,
          { icon: '💬' }
        );
      },
      'error': (data: any) => {
        toast.error(data.message);
        getWebSocket()?.close();
      },
      'warning': (data: any) => {
        toast(data.message, { icon: '⚠️' });
      }
    };

    if (lastJsonMessage?.type && handlerMap[lastJsonMessage.type]) {
      handlerMap[lastJsonMessage.type]?.(lastJsonMessage as any);
    }
  }, [lastJsonMessage, getWebSocket]);

  useEffect(() => {
    if (lastJsonMessage) {
      console.log('Message received:', lastJsonMessage);
    }
  }, [lastJsonMessage]);

  // ターンチェンジ時に toast 表示とオーバーレイの表示を行う
  useEffect(() => {
    if (!battleDetails || battleDetails.status !== 'progress') return;
    if (battleDetails.turn_player_id === battleDetails.you.info._id) {
      // toast(`あなたのターンです`, { icon: '🔥' });
      setTurnOwner("player");
    } else {
      // toast(`相手のターンです`, { icon: '🔥' });
      setTurnOwner("opponent");
    }
  }, [battleDetails?.turn, battleDetails?.turn_player_id, battleDetails?.status]);

  if (readyState === ReadyState.CONNECTING) {
    return <Matching message="サーバーに接続中..." />;
  }
  if (readyState !== ReadyState.OPEN) {
    return <Disconnected message="切断されました" />;
  }
  if (lastJsonMessage === null || battleDetails?.status === 'waiting' || !battleDetails?.opponent) {
    return <Matching message="対戦相手をさがしています..." />;
  }

  // チャット送信などのユーティリティ関数
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

  // ターン終了時のモーダル表示
  const handleEndTurn = () => {
    setIsTurnEndModalOpen(true);
  };
  const confirmEndTurn = () => {
    sendJsonMessage({ type: 'action.end_turn', forced: false });
    setIsTurnEndModalOpen(false);
  };
  const cancelEndTurn = () => {
    setIsTurnEndModalOpen(false);
  };

  // カードにエネルギーを割り振る場合、単にサーバーにリクエストを送る
  const handleAssignEnergy = (cardId: string) => {
    sendJsonMessage({ type: 'action.assign_energy', card_id: cardId });
  };

  // bench_cards をサーバー状態からレンダリングする（各カードにクリックでエネルギー割り振りリクエストを送信）
  const renderBenchCards = () => {
    const benchCards = battleDetails?.you.status.bench_cards || [];
    return benchCards.map((card, index) => (
      <Card key={`bench-${index}`} onClick={() => handleAssignEnergy(`bench-${index}`)}>
        {card ? (
          <>
            <span>カード{index + 1}</span>
            <span>{card.energy ? `(${card.energy})` : ""}</span>
          </>
        ) : (
          "□"
        )}
      </Card>
    ));
  };

  // アクティブなバトルカード（メインカード）をレンダリング
  const renderMainCard = () => {
    const card = battleDetails?.you.status.battle_card;
    return (
      <Card onClick={() => handleAssignEnergy("battle_card")}>
        {card ? (
          <>
            <span>メインカード</span>
            <span>{card.energy ? `(${card.energy})` : ""}</span>
          </>
        ) : (
          "□"
        )}
      </Card>
    );
  };

  return (
    <>
      {/* PlayerTurnOverlay をレンダリング */}
      <PlayerTurnOverlay target={turnOwner} />
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
          <p>ターン: {battleDetails?.turn}</p>
          <p>現在プレイヤー: {battleDetails?.turn_player_id}</p>
        </TurnInfo>
        <PlayerInfo>
          <p>自分の名前: {battleDetails?.you.info?.name}</p>
          <p>残りHP: {battleDetails?.you.status.life}</p>
          <p>利用可能エネルギー: {battleDetails?.you.status.energy}</p>
        </PlayerInfo>
        <ActionButtons>
          <button onClick={handleCommand}>Cmd</button>
          <button onClick={() => sendMessage('こんにちは')}>Hello</button>
          <button onClick={() => handleAction('defend')}>防御</button>
          <button onClick={() => handleAction('attack')}>攻撃</button>
          <button onClick={() => handleAction('heal')}>回復</button>
          <button onClick={() => handleAction('defend')}>防御</button>
          {battleDetails?.turn_player_id === battleDetails?.you.info._id && (
            <button onClick={handleEndTurn}>ターン終了</button>
          )}
        </ActionButtons>
        <HandCards>
          <p>手札: カード1, カード2, カード3</p>
        </HandCards>
        <BattleArea>
          <Bench>{renderBenchCards()}</Bench>
          <MainArea>{renderMainCard()}</MainArea>
        </BattleArea>
      </BattleContainer>
      <BattleTurnEndModal
        isOpen={isTurnEndModalOpen}
        onConfirm={confirmEndTurn}
        onCancel={cancelEndTurn}
      />
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 5px;
  cursor: pointer;
  &.empty {
    background-color: transparent;
    border: none;
  }
`;

export default BattleMainFrame;
