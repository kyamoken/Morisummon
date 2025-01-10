import React, { useState } from 'react';
import styled from 'styled-components';
import Header from '@/components/Header.tsx';

const Settings: React.FC = () => {
  const [theme, setTheme] = useState<string>('light');
  const [notifications, setNotifications] = useState<boolean>(true);

  const handleSaveSettings = () => {
    // セッティング保存のロジックを追加
    console.log('テーマ:', theme);
    console.log('通知:', notifications);
  };

  return (
    <SettingsContainer>
      <Header />
      <Content>
        <h1>設定</h1>
        <Form>
          <FormGroup>
            <Label>テーマ:</Label>
            <Select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="light">ダーク</option>
              <option value="dark">ライト</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>通知:</Label>
            <Checkbox
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
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
  color: white;
  width: 100%;
  text-align: center;
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
  color: white;
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

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
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
