// home.tsx
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import Header from '@/components/Header';
import { FloatingButton, FloatingDangerButton } from '@/components/FloatingButton';
import useAuth from '@/hooks/useAuth';
import BubblesBackground from '@/components/BubblesBackground';

const Home: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout('/'); // 明示的にトップページへリダイレクト
  };

  return (
    <HomeContainer>
      <BubblesBackground />
      <Header />

      <Content>
        <h1>Morisummonへようこそ！</h1>
        <ButtonContainer>
          {/* マッチング：左上（3行分を縦に占有） */}
          <FloatingButton as={Link} to="/battle" style={{ gridArea: 'matching' }}>
            <MatchingButtonInner>
              <MatchingIcon src="/static/images/battle_icon.svg" alt="マッチングアイコン" />
              <span>マッチング</span>
            </MatchingButtonInner>
          </FloatingButton>

          {/* デッキ：1行目の右カラム */}
          <FloatingButton as={Link} to="/deck" style={{ gridArea: 'deck' }}>
            <ButtonInner>
              <Icon src="/static/images/battle_icon.svg" alt="デッキアイコン" />
              <span>デッキ</span>
            </ButtonInner>
          </FloatingButton>

          {/* 図鑑：2行目の右カラム */}
          <FloatingButton as={Link} to="/card-collection" style={{ gridArea: 'zukan' }}>
            <ButtonInner>
              <Icon src="/static/images/battle_icon.svg" alt="図鑑アイコン" />
              <span>図鑑</span>
            </ButtonInner>
          </FloatingButton>

          {/* フレンド：3行目の右カラム */}
          <FloatingButton as={Link} to="/friends" style={{ gridArea: 'friend' }}>
            <ButtonInner>
              <Icon src="/static/images/battle_icon.svg" alt="フレンドアイコン" />
              <span>フレンド</span>
            </ButtonInner>
          </FloatingButton>

          {/* ガチャ：4行目の左カラム */}
          <FloatingButton as={Link} to="/gacha" style={{ gridArea: 'gacha' }}>
            <ButtonInner>
              <Icon src="/static/images/battle_icon.svg" alt="ガチャアイコン" />
              <span>ガチャ</span>
            </ButtonInner>
          </FloatingButton>

          {/* ログアウト：4行目の右カラム */}
          <FloatingDangerButton onClick={handleLogout} style={{ gridArea: 'logout' }}>
            <ButtonInner>
              <Icon src="/static/images/battle_icon.svg" alt="ログアウトアイコン" />
              <span>ログアウト</span>
            </ButtonInner>
          </FloatingDangerButton>
        </ButtonContainer>
      </Content>
    </HomeContainer>
  );
};

export default Home;

/* スタイル定義 */
const HomeContainer = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  color: white;
  text-align: center;
  overflow: hidden;
  background: linear-gradient(270deg, #383875, #6f6fa8, #383875);
  background-size: 600% 600%;
  animation: gradientAnimation 15s ease infinite;

  @keyframes gradientAnimation {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  margin-top: 130px; /* ヘッダーの高さ分だけ下にずらす */
`;

/**
 * グリッドレイアウト：
 *  1行目：左=matching、右=deck
 *  2行目：左=matching、右=zukan
 *  3行目：左=matching、右=friend
 *  4行目：左=gacha、    右=logout
 */
const ButtonContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(4, auto);
  grid-template-areas:
    "matching deck"
    "matching zukan"
    "matching friend"
    "gacha logout";
  gap: 20px;
  max-width: 600px;
  margin: 40px auto;
  justify-items: stretch;
`;

const ButtonInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Icon = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 8px;
`;

/* マッチングボタン専用の内側コンテナ（縦配置） */
const MatchingButtonInner = styled(ButtonInner)`
  flex-direction: column;
  span {
    margin-top: 8px;
  }
`;

/* マッチングアイコン専用のスタイル（ボタン全体にフィット、白色に変換） */
const MatchingIcon = styled(Icon)`
  width: 100px;
  height: auto;
  margin: 0;
  overflow: hidden;
  filter: brightness(0) invert(1);
`;
