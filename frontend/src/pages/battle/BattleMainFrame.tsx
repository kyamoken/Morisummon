import React, { useEffect, useState } from 'react';
import {
  BattleContainer,
  OpponentArea,
  PlayerArea,
  OpponentInfoArea,
  OpponentMainArea,
  OpponentBenchArea,
  PlayerInfoArea,
  PlayerBenchArea,
  PlayerMainArea,
  HandArea,
  MainCard,
  BenchCard,
  HandCard,
  MainCardEmptyArea,
  BenchCardEmptyArea,
  ReadyButton,
  ActionButtons,
  FieldTitle,
  HPGaugeContainer,
  HPGaugeFill,
  HPGaugeText
} from './BattleMainFrame.styles';
import { ReadyState } from 'react-use-websocket';
import { useNavigate } from 'react-router';
import Matching from './Matching';
import Disconnected from './Disconnected';
import toast from 'react-hot-toast';
import BattleTurnEndModal from '@/components/BattleComponents/battleTurnEndModal';
import PlayerTurnOverlay from './PlayerTurnOverlay';
import CardActionModal from '@/components/BattleComponents/CardActionModal';
import BubblesBackground from '@/components/BubblesBackground';
import { BattleDetails, BattleWebSocket, BattleWebSocketMessage, CardInfo } from '../Battle';

const handleWindowUnload = (e: BeforeUnloadEvent) => {
  e.preventDefault();
};

type Props = {
  websocket: BattleWebSocket;
};

export type ModalMode = 'actionSelect' | 'targetSelect';

/** HPゲージコンポーネント */
const HPGauge: React.FC<{ hp: number; max_hp: number }> = ({ hp, max_hp }) => {
  const ratio = hp / max_hp;
  let gaugeColor = 'green';
  if (ratio < 0.5 && ratio >= 0.2) {
    gaugeColor = 'yellow';
  } else if (ratio < 0.2 && ratio > 0) {
    gaugeColor = 'red';
  } else if (ratio <= 0) {
    gaugeColor = 'black';
  }

  return (
    <HPGaugeContainer>
      <HPGaugeFill style={{ width: `${ratio * 100}%`, backgroundColor: gaugeColor }} />
      <HPGaugeText>{hp}</HPGaugeText>
    </HPGaugeContainer>
  );
};

/** EnergyIcons コンポーネント：エネルギー数分のアイコンを表示 */
const EnergyIcons: React.FC<{ energy: number }> = ({ energy }) => {
  if (!energy) return null;
  return (
    <div style={{ position: 'absolute', bottom: 4, right: 4, display: 'flex', gap: '2px' }}>
      {Array.from({ length: energy }).map((_, i) => (
        <img key={i} src="/static/images/ENERGY.png" alt="energy" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
      ))}
    </div>
  );
};

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

  const handleEnergyAssign = () => {
    setEnergyAssignMode(true);
    toast('どのカードにエネルギー付与しますか？', { icon: '⚡' });
  };

  const handleSurrender = () => {
    if (window.confirm('降参しますか？')) {
      sendJsonMessage({ type: 'action.surrender' });
    }
  };

  /** メインカードをクリックしたとき */
  const handleMainCardClick = () => {
    const mainCard = battleDetails?.you.status.battle_card;
    if (battleDetails?.status === 'setup' && !mainCard && selectedCardIndex !== null) {
      sendJsonMessage({
        type: 'action.place_card',
        card_index: selectedCardIndex,
        to_field: 'battle_card',
      });
      setSelectedCardIndex(null);
      return;
    }
    if (battleDetails?.status === 'progress' && turnOwner === 'player' && mainCard) {
      setSelectedActionCard(mainCard);
      setModalMode('actionSelect');
      setModalVisible(true);
    }
  };

  const handleModalActionSelect = (actionType: 'attack' | 'retreat') => {
    setSelectedAction(actionType);
    setModalMode('targetSelect');
  };

  const handleModalTargetSelect = (target: { id?: string; benchIndex?: number }) => {
    if (selectedAction === 'attack') {
      sendJsonMessage({ type: 'action.attack', targetType: 'battleCard' });
    } else if (selectedAction === 'retreat' && target.benchIndex !== undefined) {
      sendJsonMessage({ type: 'action.escape', bench_index: target.benchIndex });
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
    const handlerMap: {
      [K in BattleWebSocketMessage['type']]?: (data: Extract<BattleWebSocketMessage, { type: K }>) => void;
    } = {
      'battle.update': (data) => {
        setBattleDetails(data.data);
      },
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
      info: (data: any) => {
        toast.success(data.message);
      }
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
    setTurnOwner(
      battleDetails.turn_player_id === battleDetails.you.info._id ? 'player' : 'opponent'
    );
  }, [battleDetails?.turn, battleDetails?.turn_player_id, battleDetails?.status]);

  /** 相手のメインカード */
  const renderOpponentMainCard = () => {
    const oppCard = battleDetails?.opponent?.status.battle_card;
    if (!oppCard) {
      return <MainCardEmptyArea>未配置</MainCardEmptyArea>;
    }
    if (oppCard.placeholder) return <MainCardEmptyArea>{oppCard.placeholder}</MainCardEmptyArea>;
    return (
      <MainCard onClick={(e) => e.stopPropagation()}>
        {oppCard.image ? <img src={oppCard.image} alt={oppCard.name} /> : null}
        {oppCard.hp !== undefined && oppCard.max_hp !== undefined && (
          <div style={{ position: 'absolute', top: 4, right: 4 }}>
            <HPGauge hp={oppCard.hp} max_hp={oppCard.max_hp} />
          </div>
        )}
        {oppCard.energy ? <EnergyIcons energy={oppCard.energy} /> : null}
      </MainCard>
    );
  };

  /** 相手のベンチ */
  const renderOpponentBenchArea = () => {
    const benchCards = battleDetails?.opponent?.status.bench_cards || [];
    const maxBench = battleDetails?.opponent?.status.bench_cards_max || 2;
    const benchSlots = Array.from({ length: maxBench }, (_, i) => benchCards[i] || null);

    return (
      <OpponentBenchArea>
        <FieldTitle>相手のベンチ</FieldTitle>
        {benchSlots.map((card, i) => {
          if (!card) {
            return <BenchCardEmptyArea key={i}>空</BenchCardEmptyArea>;
          }
          if (card.placeholder) return <BenchCardEmptyArea key={i}>{card.placeholder}</BenchCardEmptyArea>;
          return (
            <BenchCard
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                toast('相手のカードにはエネルギーを付与できません', { icon: '⚠️' });
              }}
            >
              {card.image ? <img src={card.image} alt={card.name} /> : null}
              {card.hp !== undefined && card.max_hp !== undefined && (
                <div style={{ position: 'absolute', top: 2, right: 2 }}>
                  <HPGauge hp={card.hp} max_hp={card.max_hp} />
                </div>
              )}
              {card.energy ? <EnergyIcons energy={card.energy} /> : null}
            </BenchCard>
          );
        })}
      </OpponentBenchArea>
    );
  };

  /** 自分のベンチ */
  const renderPlayerBenchArea = () => {
    const benchCards = battleDetails?.you.status.bench_cards || [];
    const maxBench = battleDetails?.you.status.bench_cards_max || 2;
    const benchSlots = Array.from({ length: maxBench }, (_, i) => benchCards[i] || null);

    return (
      <PlayerBenchArea>
        {benchSlots.map((card, i) => {
          if (!card) {
            return (
              <BenchCardEmptyArea
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    (((battleDetails?.status === 'setup') ||
                      (battleDetails?.status === 'progress' && turnOwner === 'player')) &&
                      selectedCardIndex !== null)
                  ) {
                    sendJsonMessage({
                      type: 'action.place_card',
                      card_index: selectedCardIndex,
                      to_field: 'bench',
                      bench_index: i,
                    });
                    setSelectedCardIndex(null);
                  }
                }}
              >
                空
              </BenchCardEmptyArea>
            );
          }
          if (card.placeholder) {
            return <BenchCardEmptyArea key={i}>{card.placeholder}</BenchCardEmptyArea>;
          }
          return (
            <BenchCard
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                if (energyAssignMode) {
                  sendJsonMessage({ type: 'action.assign_energy', card_id: `bench-${i}` });
                  setEnergyAssignMode(false);
                }
              }}
            >
              {card.image ? <img src={card.image} alt={card.name} /> : null}
              {card.hp !== undefined && card.max_hp !== undefined && (
                <div style={{ position: 'absolute', top: 2, right: 2 }}>
                  <HPGauge hp={card.hp} max_hp={card.max_hp} />
                </div>
              )}
              {card.energy ? <EnergyIcons energy={card.energy} /> : null}
            </BenchCard>
          );
        })}
      </PlayerBenchArea>
    );
  };

  /** 自分のメインカード */
  const renderPlayerMainCard = () => {
    const mainCard = battleDetails?.you.status.battle_card;
    if (!mainCard) {
      return (
        <MainCardEmptyArea
          onClick={() => {
            if (battleDetails?.status === 'setup' && selectedCardIndex !== null) {
              sendJsonMessage({
                type: 'action.place_card',
                card_index: selectedCardIndex,
                to_field: 'battle_card',
              });
              setSelectedCardIndex(null);
            }
          }}
        >
          メインカード未配置
        </MainCardEmptyArea>
      );
    }
    if (mainCard.placeholder) {
      return <MainCardEmptyArea>{mainCard.placeholder}</MainCardEmptyArea>;
    }
    return (
      <MainCard
        onClick={() => {
          if (energyAssignMode && mainCard) {
            sendJsonMessage({ type: 'action.assign_energy', card_id: 'battle_card' });
            setEnergyAssignMode(false);
          } else {
            handleMainCardClick();
          }
        }}
      >
        {mainCard.image ? (
          <img src={mainCard.image} alt={mainCard.name} />
        ) : (
          <MainCardEmptyArea>画像なし</MainCardEmptyArea>
        )}
        {mainCard.hp !== undefined && mainCard.max_hp !== undefined && (
          <div style={{ position: 'absolute', top: 4, right: 4 }}>
            <HPGauge hp={mainCard.hp} max_hp={mainCard.max_hp} />
          </div>
        )}
        {mainCard.energy ? <EnergyIcons energy={mainCard.energy} /> : null}
      </MainCard>
    );
  };

  /** 手札 */
  const renderPlayerHandArea = () => {
    const handCards = battleDetails?.you.status.hand_cards || [];
    return (
      <HandArea>
        <FieldTitle>手札</FieldTitle>
        {handCards.map((card, i) => (
          <HandCard
            key={i}
            onClick={() => {
              if (energyAssignMode) {
                toast('手札にはエネルギーを付与できません', { icon: '⚠️' });
                return;
              }
              setSelectedCardIndex(i);
            }}
            className={selectedCardIndex === i ? 'selected' : ''}
          >
            {card.image ? (
              <img src={card.image} alt={card.name} />
            ) : (
              <span>{card.name || `カード${i + 1}`}</span>
            )}
          </HandCard>
        ))}
      </HandArea>
    );
  };

  /** 準備完了ボタン */
  const renderReadyButton = () => {
    if (!battleDetails?.you.status.battle_card) return null;
    if (battleDetails.you.status.setup_done) {
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
  if (!battleDetails || battleDetails.status === 'waiting' || !battleDetails.opponent) {
    return <Matching message="対戦相手をさがしています..." />;
  }

  return (
    <>
      <PlayerTurnOverlay target={turnOwner} />
      <CardActionModal
        visible={modalVisible}
        mode={modalMode}
        selectedAction={selectedAction}
        card={selectedActionCard}
        opponentTargets={
          battleDetails.opponent?.status?.battle_card ? [battleDetails.opponent.status.battle_card] : []
        }
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
      <BubblesBackground />
      <BattleContainer>
        {/* <TopBar> */}
        {/*   <div>ターン数: {battleDetails.turn}</div> */}
        {/* </TopBar> */}
        <OpponentArea>
          <OpponentInfoArea>
            <div>相手: {battleDetails.opponent.info.name}</div>
            <div>HP: {battleDetails.opponent.status.life}</div>
            <div>手札: {battleDetails.opponent.status.hand_cards_count ?? 0}枚</div>
          </OpponentInfoArea>
          {renderOpponentBenchArea()}
          <OpponentMainArea>
            <FieldTitle>相手のメインカード</FieldTitle>
            {renderOpponentMainCard()}
          </OpponentMainArea>
        </OpponentArea>
        <PlayerArea>
          {renderPlayerHandArea()}
          <PlayerMainArea>
            <FieldTitle>自分のメインカード</FieldTitle>
            {renderPlayerMainCard()}
          </PlayerMainArea>
          <PlayerInfoArea>
            <div>自分: {battleDetails.you.info.name}</div>
            <div>HP: {battleDetails.you.status.life}</div>
            <div>エネルギー: {battleDetails.you.status.energy}</div>
            {battleDetails.status === 'setup' && renderReadyButton()}
            {battleDetails.status === 'progress' && (
              <ActionButtons>
                {turnOwner === 'player' && (
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
                <button onClick={handleSurrender}>降参</button>
                {turnOwner === 'player' && (
                  <button onClick={() => setIsTurnEndModalOpen(true)}>ターン終了</button>
                )}
              </ActionButtons>
            )}
          </PlayerInfoArea>
          {renderPlayerBenchArea()}
        </PlayerArea>
      </BattleContainer>
    </>
  );
};

export default BattleMainFrame;
