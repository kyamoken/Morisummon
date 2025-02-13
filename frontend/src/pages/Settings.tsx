import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router';
import Header from '@/components/Header.tsx';

const Settings: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<string>('dark');
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      document.documentElement.className =
        savedTheme === 'light' ? 'light-theme' : '';
    }
  }, []);

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    setSelectedTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className =
      newTheme === 'light' ? 'light-theme' : '';
  };

  const handleSaveSettings = () => {
    console.log('テーマ:', selectedTheme);
    navigate('/home');
  };

  // 戻るボタンを押したときの処理
  const handleGoBack = () => {
    if (window.history.length > 1) {
      // 履歴があれば前のページに戻る
      navigate(-1);
    } else {
      // 履歴がなければホームへ
      navigate('/');
    }
  };

  return (
    <SettingsContainer>
      <Header />
      <Content>
        <h1>設定</h1>
        <Form>
          <FormGroup>
            <Label>テーマ選択:</Label>
            <Select value={selectedTheme} onChange={handleThemeChange}>
              <option value="dark">ダーク(推奨)</option>
              <option value="light">ライト</option>
            </Select>
          </FormGroup>

          {/* 設定を保存 */}
          <Button type="button" onClick={handleSaveSettings}>
            設定を保存
          </Button>

          {/* 戻るボタンを追加 */}
          <Button type="button" onClick={handleGoBack}>
            戻る
          </Button>
        </Form>
      </Content>
    </SettingsContainer>
  );
};

export default Settings;

/* ----------------------- */
/* Styled Components       */
/* ----------------------- */

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
  width: 100%;
  text-align: center;

  h1 {
    color: var(--setting-highlight-color);
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 20px 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: bold;
  color: var(--setting-highlight-color);
`;

const Select = styled.select`
  width: 300px;
  padding: 12px 18px;
  border: 1px solid var(--input-border);
  border-radius: var(--border-radius);
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: var(--input-focus-border);
    outline: none;
  }
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
  margin-top: 20px;
  align-self: center;

  &:hover {
    background-color: var(--button-hover);
    transform: scale(1.05);
  }
`;
