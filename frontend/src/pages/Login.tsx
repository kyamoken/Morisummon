// login.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import Header from '@/components/Header.tsx';
import useAuth from '@/hooks/useAuth';
import BubblesBackground from '@/components/BubblesBackground';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username || !password) {
      alert('ユーザーネームとパスワードを入力してください');
      return;
    }

    if (await login(username, password)) {
      navigate('/home');
    } else {
      alert('ログインに失敗しました');
    }
  };

  return (
    <Container>
      <BubblesBackground />
      <ContentWrapper>
        <Helmet>
          <title>ログイン</title>
        </Helmet>
        <Header />
        <Title>ログイン</Title>
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
          <Button type="submit">ログイン</Button>
        </Form>
        <RegisterLink>
          <p>
            アカウントがありませんか？ <StyledLink to="/register">登録はこちら</StyledLink>
          </p>
        </RegisterLink>
      </ContentWrapper>
    </Container>
  );
};

export default Login;

const Container = styled.div`
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  background: linear-gradient(270deg, #383875, #6f6fa8, #383875);
  background-size: 600% 600%;
  padding-top: 70px;
  margin-top: 70px;
  animation: gradientAnimation 15s ease infinite;

  @keyframes gradientAnimation {
    0% { background-position: 0 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0 50%; }
  }

  @media (max-width: 480px) {
    padding-top: 50px;
    margin-top: 50px;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #fff;
  margin: 20px 0 30px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const Form = styled.form`
  background-color: #7a7a7a;
  border-radius: 8px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
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

const RegisterLink = styled.div`
  margin-top: 20px;
  font-size: 16px;
  color: #fff;
  opacity: 0.9;

  p {
    margin: 0;
  }
`;

const StyledLink = styled(Link)`
  color: #fff;
  text-decoration: underline;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;
