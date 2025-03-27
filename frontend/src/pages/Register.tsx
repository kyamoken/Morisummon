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
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const navigate = useNavigate();

  // ユーザ名は英数字、ひらがな、カタカナのみ許可
  const usernameRegex = /^[A-Za-z\u3040-\u309F\u30A0-\u30FF]+$/;

  const validate = (): boolean => {
    let valid = true;

    if (!username) {
      setUsernameError('ユーザーネームは必須です');
      valid = false;
    } else if (!usernameRegex.test(username)) {
      setUsernameError('ユーザーネームは英語、ひらがな、カタカナのみ使用できます');
      valid = false;
    } else {
      setUsernameError(null);
    }

    if (!password) {
      setPasswordError('パスワードは必須です');
      valid = false;
    } else if (password.length < 3) {
      setPasswordError('パスワードは３文字以上必要です');
      valid = false;
    } else {
      setPasswordError(null);
    }

    if (!confirmPassword) {
      setConfirmPasswordError('確認用パスワードを入力してください');
      valid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('パスワードが一致しません');
      valid = false;
    } else {
      setConfirmPasswordError(null);
    }

    return valid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      alert('入力内容にエラーがあります');
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
      <BubblesBackground />
      <ContentWrapper>
        <Helmet>
          <title>登録</title>
        </Helmet>
        <Header />
        <Title>新規登録</Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>ユーザーネーム:</Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {usernameError ? <ErrorText>{usernameError}</ErrorText> : null}
          </FormGroup>
          <FormGroup>
            <Label>パスワード:</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError ? <ErrorText>{passwordError}</ErrorText> : null}
          </FormGroup>
          <FormGroup>
            <Label>パスワード確認:</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPasswordError ? <ErrorText>{confirmPasswordError}</ErrorText> : null}
          </FormGroup>
          <Button type="submit">登録</Button>
        </Form>
        <LoginLink>
          <p>
            既にアカウントをお持ちですか？ <StyledLink to="/login">ログインはこちら</StyledLink>
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

const ErrorText = styled.div`
  margin-top: 4px;
  color: red;
  font-size: 0.9rem;
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
  color: #fff;
  opacity: 0.9;
  text-align: center;
`;

const StyledLink = styled(Link)`
  color: #fff;
  text-decoration: underline;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;
