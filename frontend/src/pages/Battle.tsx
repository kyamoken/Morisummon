import React, { useState } from 'react';
import useWebSocket from 'react-use-websocket';
import BattleMainFrame from './battle/BattleMainFrame';

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


const Battle: React.FC = () => {
  const [socketUrl] = useState('/ws/battle/room/main/');
  const websocket = useWebSocket<WebSocketMessage>(socketUrl);

  return (
    <BattleMainFrame websocket={websocket} />
  );
};

export default Battle;
