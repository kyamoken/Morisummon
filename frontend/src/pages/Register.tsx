// register.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import Header from '@/components/Header.tsx';
import useAuth from '@/hooks/useAuth';
import BubblesBackground from '@/components/BubblesBackground';

const Register: React.FC = () => {
  const { register } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username || !password || !confirmPassword) {
      alert('全てのフィールドを入力してください');
      return;
    }

    if (password !== confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }

    if (await register(username, password)) {
      navigate('/');
    } else {
      alert('登録に失敗しました');
    }
  };

  return (
    <Container>
      {/* バブル背景は背面に配置 */}
      <BubblesBackground />
      {/* コンテンツ部分は背景の上に表示 */}
      <ContentWrapper>
        <Helmet>
          <title>登録</title>
        </Helmet>
        <Header />
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>ユーザーネーム:</Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label>パスワード:</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label>パスワード確認:</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormGroup>
          <Button type="submit">登録</Button>
        </Form>
        <LoginLink>
          <p>
            既にアカウントをお持ちですか？ <Link to="/login">ログインはこちら</Link>
          </p>
        </LoginLink>
      </ContentWrapper>
    </Container>
  );
};

export default Register;

const Container = styled.div`
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  background: linear-gradient(270deg, #383875, #6f6fa8, #383875);
  background-size: 600% 600%;
  padding-top: 70px; /* ヘッダー分の余白 */
  margin-top: 70px;
  animation: gradientAnimation 15s ease infinite;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1; /* BubblesBackground(z-index:0)より前面に表示 */
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Form = styled.form`
  background-color: #7a7a7a;
  border-radius: 8px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  padding: 30px;
  max-width: 450px;
  width: 100%;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 18px;
  border: 1px solid #8a8a8a;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #0078d4;
    outline: none;
  }
`;

const Button = styled.button`
  background-color: #2d2d67;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 30px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background-color: #005bb5;
    transform: scale(1.05);
  }
`;

const LoginLink = styled.div`
  margin-top: 20px;
  font-size: 16px;
  color: #333;
  opacity: 0.8;
`;
