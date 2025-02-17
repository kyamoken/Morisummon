// home.tsx
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import Header from '@/components/Header';
import { FloatingButton, FloatingDangerButton } from '@/components/FloatingButton';
import useAuth from '@/hooks/useAuth';
import BubblesBackground from '@/components/BubblesBackground';

/* ===== 図鑑用 BookIconComponent ===== */
const BookIconComponent: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
  </svg>
);

const BookIconStyled = styled(BookIconComponent)`
  display: flex;
  align-items: center;
  width: 28px;
  height: auto;
  margin-right: 12px;
`;

/* ===== ログアウト用 LogoutIconComponent ===== */
const LogoutIconComponent: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path
      fillRule="evenodd"
      d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
    />
    <path
      fillRule="evenodd"
      d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
    />
  </svg>
);

const LogoutIconStyled = styled(LogoutIconComponent)`
  display: flex;
  align-items: center;
  width: 28px;
  height: auto;
  margin-right: 12px;
`;

/* ===== デッキ用 DeckIconComponent ===== */
const DeckIconComponent: React.FC<{ className?: string }> = ({ className }) => (
  <img
    className={className}
    src="/static/images/Deck_icon.png"
    alt="デッキアイコン"
  />
);

const DeckIconStyled = styled(DeckIconComponent)`
  display: flex;
  align-items: center;
  width: 28px;
  height: auto;
  margin-right: 12px;
  filter: brightness(0) invert(1);
`;

/* ===== ガチャ用 GachaIconComponent ===== */
const GachaIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 8px;
  filter: brightness(0) invert(1);
`;

const Home: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout('/'); // トップページへリダイレクト
  };

  return (
    <HomeContainer>
      <BubblesBackground />
      <Header />

      <Content>
        <h1>Morisummonへようこそ！</h1>
        <ButtonContainer>
          {/* マッチング */}
          <FloatingButton as={Link} to="/battle" style={{ gridArea: 'matching' }}>
            <MatchingButtonInner>
              <MatchingIcon src="/static/images/battle_icon.svg" alt="マッチングアイコン" />
              <span>マッチング</span>
            </MatchingButtonInner>
          </FloatingButton>

          {/* デッキ */}
          <FloatingButton as={Link} to="/deck" style={{ gridArea: 'deck' }}>
            <ButtonInner>
              <DeckIconStyled />
              <span>デッキ</span>
            </ButtonInner>
          </FloatingButton>

          {/* 図鑑 */}
          <FloatingButton as={Link} to="/card-collection" style={{ gridArea: 'zukan' }}>
            <ButtonInner>
              <BookIconStyled />
              <span>図鑑</span>
            </ButtonInner>
          </FloatingButton>

          {/* フレンド */}
          <FloatingButton as={Link} to="/friends" style={{ gridArea: 'friend' }}>
            <ButtonInner>
              <FriendIconStyled>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-people-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
                </svg>
              </FriendIconStyled>
              <span>フレンド</span>
            </ButtonInner>
          </FloatingButton>

          {/* ガチャ */}
          <FloatingButton as={Link} to="/gacha" style={{ gridArea: 'gacha' }}>
            <ButtonInner>
              <GachaIcon src="/static/images/Gacha_icon.png" alt="ガチャアイコン" />
              <span>ガチャ</span>
            </ButtonInner>
          </FloatingButton>

          {/* ログアウト */}
          <FloatingDangerButton onClick={handleLogout} style={{ gridArea: 'logout' }}>
            <ButtonInner>
              <LogoutIconStyled />
              <span>ログアウト</span>
            </ButtonInner>
          </FloatingDangerButton>
        </ButtonContainer>
      </Content>
    </HomeContainer>
  );
};

export default Home;

/* ===== スタイル定義 ===== */
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

  a {
    text-decoration: none;
    color: inherit;
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  margin-top: 130px;
`;

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

const MatchingButtonInner = styled(ButtonInner)`
  flex-direction: column;
  span {
    margin-top: 8px;
  }
`;

const MatchingIcon = styled.img`
  width: 100px;
  height: auto;
  margin: 0;
  overflow: hidden;
  filter: brightness(0) invert(1);
`;

const FriendIconStyled = styled.div`
  display: flex;
  align-items: center;
  svg {
    width: 28px;
    height: auto;
    margin-right: 8px;
  }
`;
