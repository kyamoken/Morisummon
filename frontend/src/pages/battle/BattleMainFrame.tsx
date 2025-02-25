import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Matching from './Matching';
import Disconnected from './Disconnected';
import toast from 'react-hot-toast';
import { WebSocketHook } from 'react-use-websocket/dist/lib/types';
import BattleTurnEndModal from '@/components/BattleComponents/battleTurnEndModal';
import PlayerTurnOverlay from './PlayerTurnOverlay';

const handleWindowUnload = (e: BeforeUnloadEvent) => {
  e.preventDefault();
};

type PlayerInfo = {
  _id: string;
  name: string;
  avatar: number;
};

type CardInfo = {
  id: string;
  name?: string;
  image?: string;
  energy?: number;
  placeholder?: string; // バックエンドから { placeholder: "配置済" } として送られる
};

type PlayerStatus = {
  life: number;
  battle_card: CardInfo | null;
  bench_cards: CardInfo[];
  energy: number;
  hand_cards: CardInfo[]; // 自分用（詳細表示用）
  bench_cards_max?: number;
  setup_done?: boolean;
  hand_cards_count?: number;
  _hand_cards?: CardInfo[]; // バックエンド内部用
};

type BattleDetails = {
  status: "setup" | "progress" | "waiting";
  turn: number;
  turn_player_id: string;
  you: { info: PlayerInfo; status: PlayerStatus };
  opponent?: { info: PlayerInfo; status: PlayerStatus };
};

type WebSocketMessage =
  | { type: "battle.update"; data: BattleDetails }
  | { type: "battle.turn.change"; target: "player" | "opponent" }
  | { type: "chat.message"; user: { name: string }; message: string }
  | { type: "error"; message: string }
  | { type: "warning"; message: string };

type Props = {
  websocket: WebSocketHook<WebSocketMessage>;
};

const BattleMainFrame = ({ websocket }: Props) => {
  const { sendJsonMessage, lastJsonMessage, readyState, getWebSocket } = websocket;
  const [battleDetails, setBattleDetails] = useState<BattleDetails | null>(null);
  const [isTurnEndModalOpen, setIsTurnEndModalOpen] = useState(false);
  const [turnOwner, setTurnOwner] = useState<"player" | "opponent" | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  // handleCommand を定義（コマンド入力用）
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

  useEffect(() => {
    window.addEventListener('beforeunload', handleWindowUnload);
    return () => window.removeEventListener('beforeunload', handleWindowUnload);
  }, []);

  useEffect(() => {
    const handlerMap: { [K in WebSocketMessage['type']]?: (data: Extract<WebSocketMessage, { type: K }>) => void } = {
      'battle.update': (data) => setBattleDetails(data.data),
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

  // 戦闘フェーズの場合、ターン変更の処理
  useEffect(() => {
    if (!battleDetails || battleDetails.status !== 'progress') return;
    setTurnOwner(
      battleDetails.turn_player_id === battleDetails.you.info._id ? 'player' : 'opponent'
    );
  }, [battleDetails?.turn, battleDetails?.turn_player_id, battleDetails?.status]);

  if (readyState === ReadyState.CONNECTING) {
    return <Matching message="サーバーに接続中..." />;
  }
  if (readyState !== ReadyState.OPEN) {
    return <Disconnected message="切断されました" />;
  }
  if (!battleDetails || battleDetails.status === 'waiting' || !battleDetails.opponent) {
    return <Matching message="対戦相手をさがしています..." />;
  }

  // 相手の場情報のレンダリング関数
  const renderOpponentBattleCard = () => {
    const oppCard = battleDetails.opponent?.status?.battle_card;
    if (!oppCard) return <EmptyArea>未配置</EmptyArea>;
    if (oppCard.placeholder) {
      return <Card>{oppCard.placeholder}</Card>;
    }
    return (
      <Card>
        {oppCard.image && <img src={oppCard.image} alt={oppCard.name} />}
        <span>{oppCard.name}</span>
        <span>{oppCard.energy ? `(${oppCard.energy})` : ''}</span>
      </Card>
    );
  };

  const renderOpponentBenchArea = () => {
    const benchCards = battleDetails.opponent?.status?.bench_cards || [];
    const maxBench = battleDetails.opponent?.status?.bench_cards_max || 2;
    const benchSlots = Array.from({ length: maxBench }, (_, i) => benchCards[i] || null);
    return (
      <AreaBox>
        {benchSlots.map((card, index) => (
          <BenchSlot key={`opp-bench-${index}`}>
            {card ? (
              card.placeholder ? (
                <Card>{card.placeholder}</Card>
              ) : (
                <Card>
                  {card.image && <img src={card.image} alt={card.name} />}
                  <span>{card.name}</span>
                  <span>{card.energy ? `(${card.energy})` : ''}</span>
                </Card>
              )
            ) : (
              <EmptyArea>空</EmptyArea>
            )}
          </BenchSlot>
        ))}
      </AreaBox>
    );
  };

  const renderOpponentHandCount = () => {
    const oppStatus = battleDetails.opponent?.status || {};
    const count = oppStatus.hand_cards_count ?? oppStatus._hand_cards?.length ?? 0;
    return <div>手札: {count}枚</div>;
  };

  // 自分の場情報のレンダリング関数
  const renderHandCards = () => {
    const handCards = battleDetails.you.status.hand_cards || [];
    return handCards.map((card, index) => (
      <HandCard
        key={`hand-${index}`}
        onClick={() => setSelectedCardIndex(index)}
        selected={selectedCardIndex === index}
      >
        <span>{card.name || `カード${index + 1}`}</span>
      </HandCard>
    ));
  };

  const renderMainArea = () => {
    const mainCard = battleDetails.you.status.battle_card;
    return (
      <AreaBox
        onClick={() => {
          if (!mainCard && selectedCardIndex !== null) {
            sendJsonMessage({
              type: 'action.place_card',
              card_index: selectedCardIndex,
              to_field: 'battle_card',
            });
            setSelectedCardIndex(null);
          }
        }}
      >
        {mainCard ? (
          <Card>
            <span>メインカード</span>
            <span>{mainCard.energy ? `(${mainCard.energy})` : ''}</span>
          </Card>
        ) : (
          <EmptyArea>メインカード未配置</EmptyArea>
        )}
      </AreaBox>
    );
  };

  const renderBenchArea = () => {
    const benchCards = battleDetails.you.status.bench_cards || [];
    const maxBench = battleDetails.you.status.bench_cards_max || 2;
    const benchSlots = Array.from({ length: maxBench }, (_, i) => benchCards[i] || null);
    return (
      <AreaBox>
        {benchSlots.map((card, index) => (
          <BenchSlot
            key={`bench-slot-${index}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!card && selectedCardIndex !== null) {
                sendJsonMessage({
                  type: 'action.place_card',
                  card_index: selectedCardIndex,
                  to_field: 'bench',
                });
                setSelectedCardIndex(null);
              }
            }}
          >
            {card ? (
              <Card>
                <span>{card.name || `カード${index + 1}`}</span>
                <span>{card.energy ? `(${card.energy})` : ''}</span>
              </Card>
            ) : (
              <EmptyArea>空</EmptyArea>
            )}
          </BenchSlot>
        ))}
      </AreaBox>
    );
  };

  const renderReadyButton = () => {
    if (!battleDetails.you.status.battle_card) return null;
    if (battleDetails.you.status.setup_done) {
      return <ReadyButton disabled>準備完了待機中</ReadyButton>;
    }
    return (
      <ReadyButton onClick={() => sendJsonMessage({ type: 'action.setup_complete' })}>
        準備完了
      </ReadyButton>
    );
  };

  return (
    <>
      <PlayerTurnOverlay target={turnOwner} />
      <div className="global-style" />
      <BattleContainer>
        <OpponentInfo>
          <p>相手の名前: {battleDetails.opponent?.info?.name}</p>
          <p>残りHP: {battleDetails.opponent?.status?.life}</p>
        </OpponentInfo>
        <TurnInfo>
          <p>ターン: {battleDetails.turn}</p>
          <p>現在プレイヤー: {battleDetails.turn_player_id}</p>
        </TurnInfo>
        <PlayerInfo>
          <p>自分の名前: {battleDetails.you?.info?.name}</p>
          <p>残りHP: {battleDetails.you?.status?.life}</p>
          <p>利用可能エネルギー: {battleDetails.you?.status?.energy}</p>
        </PlayerInfo>
        <ActionButtons>
          <button onClick={handleCommand}>Cmd</button>
          <button onClick={() => sendJsonMessage({ type: 'chat.message', message: 'こんにちは' })}>
            msg
          </button>
          <button onClick={() => handleAction('attack')}>攻撃</button>
          {battleDetails.turn_player_id === battleDetails.you?.info?._id && (
            <button onClick={() => setIsTurnEndModalOpen(true)}>ターン終了</button>
          )}
        </ActionButtons>

        {battleDetails.status === 'setup' && (
          <SetupSection>
            <HandCards>
              <h3>手札</h3>
              <HandCardsContainer>{renderHandCards()}</HandCardsContainer>
            </HandCards>
            <Field>
              <FieldColumn>
                <h4>メインエリア</h4>
                {renderMainArea()}
              </FieldColumn>
              <FieldColumn>
                <h4>ベンチ</h4>
                {renderBenchArea()}
              </FieldColumn>
            </Field>
            {renderReadyButton()}
          </SetupSection>
        )}

        {battleDetails.status !== 'setup' && (
          <BattleArea>
            <OpponentField>
              <h3>相手の場</h3>
              <Field>
                <FieldColumn>
                  <h4>メインエリア</h4>
                  {renderOpponentBattleCard()}
                </FieldColumn>
                <FieldColumn>
                  <h4>ベンチ</h4>
                  {renderOpponentBenchArea()}
                </FieldColumn>
              </Field>
              {renderOpponentHandCount()}
            </OpponentField>
            <PlayerField>
              <h3>自分の場</h3>
              <Field>
                <FieldColumn>
                  <h4>メインエリア</h4>
                  {renderMainArea()}
                </FieldColumn>
                <FieldColumn>
                  <h4>ベンチ</h4>
                  {renderBenchArea()}
                </FieldColumn>
              </Field>
              <div>
                <h4>手札</h4>
                <HandCardsContainer>{renderHandCards()}</HandCardsContainer>
              </div>
            </PlayerField>
          </BattleArea>
        )}
      </BattleContainer>
      <BattleTurnEndModal
        isOpen={isTurnEndModalOpen}
        onConfirm={() => {
          sendJsonMessage({ type: 'action.end_turn', forced: false });
          setIsTurnEndModalOpen(false);
        }}
        onCancel={() => setIsTurnEndModalOpen(false)}
      />
    </>
  );
};

const BattleContainer = styled.div`
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

const SetupSection = styled.div`
  grid-area: field;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HandCards = styled.div`
  text-align: center;
  margin-bottom: 15px;
`;

const HandCardsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const Field = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 15px;
`;

const FieldColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BattleArea = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
`;

const OpponentField = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PlayerField = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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
  /* 画像をカードサイズに合わせる */
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const HandCard = styled(Card)<{ selected?: boolean }>`
  width: 60px;
  height: 90px;
  font-size: 0.8rem;
  border: 2px solid ${(props) => (props.selected ? '#FFD700' : '#fff')};
`;

const EmptyArea = styled.div`
  width: 60px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #999;
  color: #999;
`;

const BenchSlot = styled.div`
  margin: 0 5px;
  cursor: pointer;
`;

const ReadyButton = styled.button`
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

const AreaBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 120px;
  cursor: pointer;
`;

export default BattleMainFrame;
