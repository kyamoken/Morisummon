import React, { createContext, useReducer, useContext, Dispatch } from 'react';

// APIから取得する音源情報の型（BGM・SEどちらも使える）
export interface Sound {
  id: number;
  name: string;
  is_bgm: boolean;
  file_url: string;
}

// 再生関連の状態を管理するための型
interface SoundState {
  currentTrack: Sound | null; // BGM用。常時再生する音楽を管理
  isPlaying: boolean;
  volume: number;
  loop: boolean;
}

const initialState: SoundState = {
  currentTrack: null,
  isPlaying: false,
  volume: 1.0,
  loop: false,
};

type SoundAction =
  | { type: 'SET_CURRENT_TRACK'; payload: Sound | null }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_LOOP'; payload: boolean };

const soundReducer = (state: SoundState, action: SoundAction): SoundState => {
  switch (action.type) {
    case 'SET_CURRENT_TRACK':
      return { ...state, currentTrack: action.payload };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_LOOP':
      return { ...state, loop: action.payload };
    default:
      return state;
  }
};

interface SoundContextType {
  state: SoundState;
  dispatch: Dispatch<SoundAction>;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

interface SoundProviderProps {
  children: React.ReactNode;
}

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(soundReducer, initialState);
  return (
    <SoundContext.Provider value={{ state, dispatch }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
