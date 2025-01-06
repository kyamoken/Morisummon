import React, { useState } from 'react';
import ky from 'ky';
import { Link } from 'react-router';
import '../GlobalStyle.css'; // CSSファイルをインポート
import Header from '../components/Header.tsx'; // インポート

const theme = {
  primaryColor: '#2d2d67',
  backgroundColor: '#1a1a23',
  textColor: '#333',
  cardBackground: '#7a7a7a',
  buttonHover: '#005bb5',
  inputBorder: '#8a8a8a',
  inputFocusBorder: '#0078d4',
  borderRadius: '8px',
  boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
};

// コンポーネント定義
const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await ky.post('http://localhost:8000/api/register/', {
        json: { username, password, email },
      }).json();
      console.log(response);
    } catch (error) {
      console.error('登録に失敗しました:', error);
    }
  };

  return (
    <Container>
      <div className="global-style" /> {/* GlobalStyleの代わりにdivを追加 */}
      <Header /> {/* ヘッダーを追加 */}
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
          <Label>メールアドレス:</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <Button type="submit">登録</Button>
      </Form>
      <LoginLink>
        アカウントが存在しますか？ <Link to="/login">ログインはこちら</Link>
      </LoginLink>
    </Container>
  );
};

// Styled Components
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${theme.backgroundColor};
  padding-top: 70px; /* ヘッダーの高さ分の余白を追加 */
`;

const Form = styled.form`
  background-color: ${theme.cardBackground};
  border-radius: ${theme.borderRadius};
  box-shadow: ${theme.boxShadow};
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
  color: ${theme.textColor};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 18px;
  border: 1px solid ${theme.inputBorder};
  border-radius: ${theme.borderRadius};
  font-size: 16px;
  transition: border-color 0.3s ease;
  &:focus {
    border-color: ${theme.inputFocusBorder};
    outline: none;
  }
`;

const Button = styled.button`
  background-color: ${theme.primaryColor};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius};
  padding: 12px 30px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  &:hover {
    background-color: ${theme.buttonHover};
    transform: scale(1.05);
  }
`;

const LoginLink = styled.div`
  margin-top: 15px;
  font-size: 14px;
  color: ${theme.textColor};
  a {
    color: ${theme.primaryColor};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

export default Register;
