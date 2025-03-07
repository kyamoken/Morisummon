// BattleMainFrame.tsx
import React, { useEffect, useState } from 'react';
import {
  BattleContainer, TopBar, TurnInfo, OpponentInfo, OpponentFieldArea, FieldTitle,
  BenchArea, BenchSlot, SetupArea, SetupInfo, HandContainer, SelfFieldArea, BattleArea,
  HandSection, HandTitle, MainArea, PlayerInfoBar, PlayerInfoBox, ActionButtons, Card,
  HandCard, EmptyArea, ReadyButton
} from './BattleMainFrame.styles';
import { ReadyState } from 'react-use-websocket';
import { useNavigate } from 'react-router';
import Matching from './Matching';
import Disconnected from './Disconnected';
import toast from 'react-hot-toast';
import { WebSocketHook } from 'react-use-websocket/dist/lib/types';
import BattleTurnEndModal from '@/components/BattleComponents/battleTurnEndModal';
import PlayerTurnOverlay from './PlayerTurnOverlay';
import CardActionModal from '@/components/BattleComponents/CardActionModal';

const handleWindowUnload = (e: BeforeUnloadEvent) => {
  e.preventDefault();
};

type PlayerInfo = {
  _id: string;
  name: string;
  avatar: number;
};

export type CardInfo = {
  id: string;
  name?: string;
  image?: string;
  energy?: number;
  hp?: number; // HP表示用
  placeholder?: string;
};

type PlayerStatus = {
  life: number;
  battle_card: CardInfo | null;
  bench_cards: CardInfo[];
  energy: number;
  hand_cards: CardInfo[];
  bench_cards_max?: number;
  setup_done?: boolean;
  hand_cards_count?: number;
  _hand_cards?: CardInfo[];
};

type BattleDetails = {
  status: 'setup' | 'progress' | 'waiting' | 'finished';
  turn: number;
  turn_player_id: string;
  you: { info: PlayerInfo; status: PlayerStatus };
  opponent?: { info: PlayerInfo; status: PlayerStatus };
  room_id?: string;
  winner?: string;
};

type WebSocketMessage =
  | { type: 'battle.update'; data: BattleDetails }
  | { type: 'battle.turn.change'; target: 'player' | 'opponent' }
  | { type: 'chat.message'; user: { name: string }; message: string }
  | { type: 'error'; message: string }
  | { type: 'warning'; message: string };

type Props = {
  websocket: WebSocketHook<WebSocketMessage>;
};

export type ModalMode = 'actionSelect' | 'targetSelect';

const BattleMainFrame: React.FC<Props> = ({ websocket }) => {
  const navigate = useNavigate();
  const { sendJsonMessage, lastJsonMessage, readyState, getWebSocket } = websocket;
  const [battleDetails, setBattleDetails] = useState<BattleDetails | null>(null);
  const [isTurnEndModalOpen, setIsTurnEndModalOpen] = useState(false);
  const [turnOwner, setTurnOwner] = useState<'player' | 'opponent' | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [energyAssignMode, setEnergyAssignMode] = useState(false);

  // モーダル用状態
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('actionSelect');
  const [selectedAction, setSelectedAction] = useState<'attack' | 'retreat' | null>(null);
  const [selectedActionCard, setSelectedActionCard] = useState<CardInfo | null>(null);

  // エネルギー付与ハンドラ
  const handleEnergyAssign = () => {
    setEnergyAssignMode(true);
    toast('どのカードにエネルギー付与しますか？', { icon: '⚡' });
  };

  // 降参ハンドラ
  const handleSurrender = () => {
    if (window.confirm('降参しますか？')) {
      sendJsonMessage({ type: 'action.surrender' });
    }
  };

  // メインカードクリック時の処理
  const handleMainCardClick = () => {
    const mainCard = battleDetails?.you.status.battle_card;
    if (battleDetails?.status === 'setup' && !mainCard && selectedCardIndex !== null) {
      sendJsonMessage({ type: 'action.place_card', card_index: selectedCardIndex, to_field: 'battle_card' });
      setSelectedCardIndex(null);
    } else if (battleDetails?.status !== 'setup' && turnOwner === 'player' && mainCard) {
      setSelectedActionCard(mainCard);
      setModalMode('actionSelect');
      setModalVisible(true);
    }
  };

  // モーダル内アクション選択後
  const handleModalActionSelect = (actionType: 'attack' | 'retreat') => {
    setSelectedAction(actionType);
    setModalMode('targetSelect');
  };

  // モーダル内ターゲット選択後
  const handleModalTargetSelect = (target: { id?: string; benchIndex?: number }) => {
    if (selectedAction === 'attack') {
      sendJsonMessage({ type: 'action.attack', targetType: 'battleCard' });
      toast.success('攻撃を実行しました');
    } else if (selectedAction === 'retreat' && target.benchIndex !== undefined) {
      sendJsonMessage({ type: 'action.escape', bench_index: target.benchIndex });
      toast.success('逃げ（入れ替え）を実行しました');
    }
    setModalVisible(false);
    setSelectedAction(null);
    setSelectedActionCard(null);
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
            <div style={{ fontSize: '80%', color: 'gray', textAlign: 'right' }}>
              By {data.user?.name}
            </div>
          </div>,
          { icon: '💬' }
        );
      },
      error: (data: any) => {
        toast.error(data.message);
        getWebSocket()?.close();
      },
      warning: (data: any) => {
        toast(data.message, { icon: '⚠️' });
      },
    };
    if (lastJsonMessage?.type && handlerMap[lastJsonMessage.type]) {
      handlerMap[lastJsonMessage.type]?.(lastJsonMessage as any);
    }
  }, [lastJsonMessage, getWebSocket]);

  useEffect(() => {
    if (lastJsonMessage) console.log('Message received:', lastJsonMessage);
  }, [lastJsonMessage]);

  useEffect(() => {
    if (!battleDetails) return;
    if (battleDetails.status === 'finished') {
      const battleResult = {
        room_id: battleDetails.room_id || '',
        winner: battleDetails.winner || '',
      };
      navigate('/result', { state: { battleResult } });
    }
  }, [battleDetails, navigate]);

  useEffect(() => {
    if (!battleDetails || battleDetails.status !== 'progress') return;
    setTurnOwner(battleDetails.turn_player_id === battleDetails.you.info._id ? 'player' : 'opponent');
  }, [battleDetails?.turn, battleDetails?.turn_player_id, battleDetails?.status]);

  const renderOpponentBattleCard = () => {
    const oppCard = battleDetails?.opponent?.status?.battle_card;
    if (!oppCard) return <EmptyArea>未配置</EmptyArea>;
    if (oppCard.placeholder) return <Card>{oppCard.placeholder}</Card>;
    return (
      <Card onClick={(e) => e.stopPropagation()}>
        {oppCard.image ? <img src={oppCard.image} alt={oppCard.name} /> : null}
        <span>HP: {oppCard.hp}</span>
        <span>{oppCard.energy ? `(${oppCard.energy})` : ''}</span>
      </Card>
    );
  };

  const renderOpponentBenchArea = () => {
    const benchCards = battleDetails?.opponent?.status?.bench_cards || [];
    const maxBench = battleDetails?.opponent?.status?.bench_cards_max || 2;
    const benchSlots = Array.from({ length: maxBench }, (_, i) => benchCards[i] || null);
    return (
      <BenchArea>
        {benchSlots.map((card, index) => (
          <BenchSlot
            key={`opp-bench-${index}`}
            onClick={(e) => {
              e.stopPropagation();
              if (energyAssignMode && card) {
                sendJsonMessage({ type: 'action.assign_energy', card_id: `bench-${index}` });
                setEnergyAssignMode(false);
              }
            }}
          >
            {card ? (
              card.placeholder ? (
                <Card>{card.placeholder}</Card>
              ) : (
                <Card>
                  {card.image ? <img src={card.image} alt={card.name} /> : null}
                  <span>{card.energy ? `(${card.energy})` : ''}</span>
                </Card>
              )
            ) : (
              <EmptyArea>空</EmptyArea>
            )}
          </BenchSlot>
        ))}
      </BenchArea>
    );
  };

  const renderOpponentHandCount = () => {
    const oppStatus = battleDetails?.opponent?.status || {};
    const count = oppStatus.hand_cards_count ?? oppStatus._hand_cards?.length ?? 0;
    return <div>手札: {count}枚</div>;
  };

  const renderHandCards = () => {
    const handCards = battleDetails?.you.status.hand_cards || [];
    return (
      <HandContainer>
        {handCards.map((card, index) => (
          <HandCard
            key={`hand-${index}`}
            onClick={() => {
              if (energyAssignMode) {
                toast("手札にはエネルギーを付与できません", { icon: "⚠️" });
                return;
              }
              setSelectedCardIndex(index);
            }}
            selected={selectedCardIndex === index}
          >
            {card.image ? <img src={card.image} alt={card.name} /> : <span>{card.name || `カード${index + 1}`}</span>}
          </HandCard>
        ))}
      </HandContainer>
    );
  };

  const renderMainArea = () => {
    const mainCard = battleDetails?.you.status.battle_card;
    return (
      <MainArea
        onClick={() => {
          if (energyAssignMode && mainCard) {
            sendJsonMessage({ type: 'action.assign_energy', card_id: 'battle_card' });
            setEnergyAssignMode(false);
          } else {
            handleMainCardClick();
          }
        }}
      >
        {mainCard ? (
          <Card>
            {mainCard.image ? <img src={mainCard.image} alt={mainCard.name} /> : <EmptyArea>画像なし</EmptyArea>}
            <span>HP: {mainCard.hp}</span>
            <span>{mainCard.energy ? `(${mainCard.energy})` : ''}</span>
          </Card>
        ) : (
          <EmptyArea>メインカード未配置</EmptyArea>
        )}
      </MainArea>
    );
  };

  const renderBenchArea = () => {
    const benchCards = battleDetails?.you.status.bench_cards || [];
    const maxBench = battleDetails?.you.status.bench_cards_max || 2;
    const benchSlots = Array.from({ length: maxBench }, (_, i) => benchCards[i] || null);
    return (
      <BenchArea>
        {benchSlots.map((card, index) => (
          <BenchSlot
            key={`bench-slot-${index}`}
            onClick={(e) => {
              e.stopPropagation();
              if (energyAssignMode && card) {
                sendJsonMessage({ type: 'action.assign_energy', card_id: `bench-${index}` });
                setEnergyAssignMode(false);
              } else if (!card && selectedCardIndex !== null && (battleDetails?.status === 'setup' || turnOwner === 'player')) {
                sendJsonMessage({ type: 'action.place_card', card_index: selectedCardIndex, to_field: 'bench' });
                setSelectedCardIndex(null);
              }
            }}
          >
            {card ? (
              <Card>
                {card.image ? <img src={card.image} alt={card.name} /> : null}
                <span>{card.energy ? `(${card.energy})` : ''}</span>
              </Card>
            ) : (
              <EmptyArea>空</EmptyArea>
            )}
          </BenchSlot>
        ))}
      </BenchArea>
    );
  };

  const renderReadyButton = () => {
    if (!battleDetails?.you.status.battle_card) return null;
    if (battleDetails?.you.status.setup_done) {
      return <ReadyButton disabled>準備完了待機中</ReadyButton>;
    }
    return (
      <ReadyButton onClick={() => sendJsonMessage({ type: 'action.setup_complete' })}>
        準備完了
      </ReadyButton>
    );
  };

  if (readyState === ReadyState.CONNECTING) return <Matching message="サーバーに接続中..." />;
  if (readyState !== ReadyState.OPEN) return <Disconnected message="切断されました" />;
  if (!battleDetails || battleDetails.status === 'waiting' || !battleDetails.opponent) return <Matching message="対戦相手をさがしています..." />;

  return (
    <>
      <PlayerTurnOverlay target={turnOwner} />
      <CardActionModal
        visible={modalVisible}
        mode={modalMode}
        selectedAction={selectedAction}
        card={selectedActionCard}
        opponentTargets={battleDetails.opponent?.status?.battle_card ? [battleDetails.opponent.status.battle_card] : []}
        benchTargets={battleDetails.you.status.bench_cards || []}
        onActionSelect={handleModalActionSelect}
        onTargetSelect={handleModalTargetSelect}
        onClose={() => {
          setModalVisible(false);
          setSelectedAction(null);
          setSelectedActionCard(null);
        }}
      />
      <BattleTurnEndModal
        isOpen={isTurnEndModalOpen}
        onConfirm={() => {
          sendJsonMessage({ type: 'action.end_turn', forced: false });
          setIsTurnEndModalOpen(false);
        }}
        onCancel={() => setIsTurnEndModalOpen(false)}
      />
      <BattleContainer>
        <TopBar>
          <TurnInfo>
            <div>ターン: {battleDetails.turn}</div>
            <div>現在プレイヤーID: {battleDetails.turn_player_id}</div>
          </TurnInfo>
          <OpponentInfo>
            <div>相手: {battleDetails.opponent.info.name}</div>
            <div>相手HP: {battleDetails.opponent.status.life}</div>
            <div>{renderOpponentHandCount()}</div>
          </OpponentInfo>
        </TopBar>
        <OpponentFieldArea>
          <FieldTitle>相手のベンチ</FieldTitle>
          {renderOpponentBenchArea()}
          <FieldTitle>相手のメインエリア</FieldTitle>
          {renderOpponentBattleCard()}
        </OpponentFieldArea>
        {battleDetails.status === 'setup' ? (
          <SetupArea>
            <SetupInfo>
              <div>自分の手札</div>
              <HandContainer>{renderHandCards()}</HandContainer>
              {renderReadyButton()}
            </SetupInfo>
            <SelfFieldArea>
              <FieldTitle>メインエリア</FieldTitle>
              {renderMainArea()}
              <FieldTitle>ベンチ</FieldTitle>
              {renderBenchArea()}
            </SelfFieldArea>
          </SetupArea>
        ) : (
          <BattleArea>
            <SelfFieldArea>
              <FieldTitle>自分のメインエリア</FieldTitle>
              {renderMainArea()}
              <FieldTitle>ベンチ</FieldTitle>
              {renderBenchArea()}
            </SelfFieldArea>
            <HandSection>
              <HandTitle>手札</HandTitle>
              <HandContainer>{renderHandCards()}</HandContainer>
            </HandSection>
          </BattleArea>
        )}
        <PlayerInfoBar>
          <PlayerInfoBox>
            <div>自分: {battleDetails.you.info.name}</div>
            <div>HP: {battleDetails.you.status.life}</div>
            <div>エネルギー: {battleDetails.you.status.energy}</div>
          </PlayerInfoBox>
          <ActionButtons>
            {battleDetails.status === 'progress' && turnOwner === 'player' && (
              <>
                <button
                  onClick={() => {
                    const mainCard = battleDetails.you.status.battle_card;
                    if (mainCard) {
                      setSelectedActionCard(mainCard);
                      setModalMode('actionSelect');
                      setModalVisible(true);
                    }
                  }}
                >
                  攻撃/逃げ
                </button>
                <button onClick={handleEnergyAssign}>エネルギー付与</button>
              </>
            )}
            {battleDetails.status === 'progress' && (
              <button onClick={handleSurrender}>降参</button>
            )}
            {battleDetails.turn_player_id === battleDetails.you.info._id && (
              <button onClick={() => setIsTurnEndModalOpen(true)}>ターン終了</button>
            )}
          </ActionButtons>
        </PlayerInfoBar>
      </BattleContainer>
    </>
  );
};

export default BattleMainFrame;
