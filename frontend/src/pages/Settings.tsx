import React, { useState } from 'react';
import styled from 'styled-components';
import Header from '@/components/Header.tsx';

const Settings: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<string>('dark');

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTheme(e.target.value);
  };

  const handleSaveSettings = () => {
    document.documentElement.className = selectedTheme === 'light' ? 'light-theme' : '';
    console.log('テーマ:', selectedTheme);
  };

  return (
    <SettingsContainer>
      <Header />
      <Content>
        <h1>設定</h1>
        <Form>
          <FormGroup>
            <Label>テーマ:</Label>
            <Select value={selectedTheme} onChange={handleThemeChange}>
              <option value="dark">ダーク(推奨)</option>
              <option value="light">ライト</option>
            </Select>
          </FormGroup>
          <Button type="button" onClick={handleSaveSettings}>設定を保存</Button>
        </Form>
      </Content>
    </SettingsContainer>
  );
};

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
    color: var(--setting-highlight-color); /* 色を変更 */
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

export default Settings;
