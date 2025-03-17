import React, { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import BattleMainFrame from './battle/BattleMainFrame';
import { WebSocketHook } from 'react-use-websocket/dist/lib/types';
import { ky } from '@/utils/api';
import Matching from './battle/Matching';

export type PlayerInfo = {
  _id: string;
  name: string;
  avatar: number;
}

export type CardInfo = {
  id: string;
  name?: string;
  image?: string;
  energy?: number;
  hp?: number;
  max_hp?: number;
  placeholder?: string;
};

export type PlayerStatus = {
  life: number;
  battle_card: CardInfo | null;
  bench_cards: CardInfo[];
  energy: number;
  hand_cards: CardInfo[];
  bench_cards_max?: number;
  setup_done?: boolean;
  hand_cards_count?: number;
  _hand_cards?: CardInfo[];
}

export type BattleDetails = {
  status: 'setup' | 'progress' | 'waiting' | 'finished';
  turn: number;
  turn_player_id: string;
  you: { info: PlayerInfo; status: PlayerStatus };
  opponent?: { info: PlayerInfo; status: PlayerStatus };
  room_id?: string;
  winner?: string;
}

export type BattleWebSocketMessage =
  | { type: 'battle.update'; data: BattleDetails }
  | { type: 'battle.turn.change'; target: 'player' | 'opponent' }
  | { type: 'chat.message'; user: { name: string }; message: string }
  | { type: 'error'; message: string }
  | { type: 'warning'; message: string }
  | { type: 'info'; message: string };

export type BattleWebSocket = WebSocketHook<BattleWebSocketMessage>;

export default function Page() {
  const [roomSlug, setRoomSlug] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const url = await ky.get('api/battle/claim-slug/').json<{ slug: string }>();
      setRoomSlug(url.slug);
    })();
  }, []);

  if (roomSlug === null) {
    return (
      <Matching message="ルームを検索中..." />
    );
  }

  return (
    <MainFrame websocketSlug={roomSlug} />
  );
}


type MainFrameProps = {
  websocketSlug: string;
}
function MainFrame({ websocketSlug }: MainFrameProps) {
  const [socketUrl] = useState(`/ws/battle/room/${websocketSlug}/`);
  const websocket = useWebSocket<BattleWebSocketMessage>(socketUrl);

  return (
    <BattleMainFrame websocket={websocket} />
  );
}
