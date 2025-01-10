import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';
import Header from '@/components/Header.tsx'; // ヘッダーコンポーネントをインポート
import useAuth from '@/hooks/useAuth.tsx';

const Home: React.FC = () => {
  const { user, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
  }

  return (
    <HomeContainer>
      <Header />
      {isLoading ? (
        <p>ロード中...</p>
      ) : user ? (
        <p>{user.username}さん、こんにちは！</p>
      ) : (
        <p>ログインしていません</p>
      )}
      <Content>
        <h1>ボケモンカードへようこそ！</h1>
        <ButtonContainer>
          <Button as={Link} to="/matching">マッチング</Button>
          <Button as={Link} to="/deck">デッキ</Button>
          <Button as={Link} to="/settings">設定</Button>
        </ButtonContainer>
        <LogoutButton onClick={handleLogout}>ログアウト</LogoutButton>
      </Content>
    </HomeContainer>
  );
};

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: var(--background-color);
  color: white;
  width: 100%;
  text-align: center;
`;

const Content = styled.div`
  text-align: center;
  margin: 0 auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; /* 追加 */
  gap: 20px;
  margin: 20px 0;
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 12px 30px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  width: 200px;

  &:hover {
    background-color: var(--button-hover);
    transform: scale(1.05);
  }
`;

const LogoutButton = styled(Button)`
  background-color: red;
  margin-top: 20px;

  &:hover {
    background-color: darkred;
  }
`;

export default Home;
