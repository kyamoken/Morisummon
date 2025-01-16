import Header from "@/components/Header";
import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import styled from "styled-components";

type ReceivedMessage = {
  user?: {
    id: number;
    name: string;
  };
  message: string;
};

const Page = () => {
  const { sendJsonMessage, lastJsonMessage } = useWebSocket<ReceivedMessage>("ws://localhost:8000/ws/somepath/");

  // 受信したメッセージをリストで保持するstate
  const [receivedMessages, setReceivedMessages] = useState<ReceivedMessage[]>([]);

  // 入力中のメッセージを保持するstate
  const [inputValue, setInputValue] = useState<string>("");

  // メッセージを受信したらreceivedMessagesに追加
  useEffect(() => {
    if (lastJsonMessage) {
      setReceivedMessages((prev) => [...prev, lastJsonMessage]);
      console.log('Message received:', lastJsonMessage);
    }
  }, [lastJsonMessage]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 入力欄が空の場合は何もしない
    if (!inputValue) {
      return;
    }

    // sendJsonMessageでWebSocketを介してメッセージを送信
    sendJsonMessage({
      message: inputValue,
    });

    // メッセージを送信したら入力欄を空にする
    setInputValue("");
  };

  return (
    <div>
      <Header />
      <div style={{ marginTop: 80 }}></div>
      <ChatForm onSubmit={handleSubmit}>
        <input type="text" className="message-input" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        <button type="submit">Send Message</button>
      </ChatForm>
      <ChatItems>
        {receivedMessages.slice().reverse().map((m, i) => (
          <ChatItem key={i}>
            <p>{m.message}</p>
            <small style={{ color: "gray" }}>By {m?.user?.name || 'Anonymous'}</small>
          </ChatItem>
        ))}
      </ChatItems>
    </div>
  );
};

const ChatForm = styled.form`
display: flex;
padding: 10px;
gap: 8px;
.message-input {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  border: none;
  &:focus {
    outline: solid 3px rgba(68, 155, 222, 0.4);
  }
}
button[type="submit"] {
  padding: 8px 16px;
  background-color: #2a2b2e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background-color: #3a3b3e;
  }
  &:focus {
    outline: solid 3px rgba(68, 155, 222, 0.4);
  }
}
`;

const ChatItems = styled.div`
display: flex;
flex-direction: column;
padding: 10px;
gap: 10px;
`;

const ChatItem = styled.div`
  padding: 8px 16px;
  background-color: #2a2b2e;
  border-radius: 8px;
  &:last-child {
    border-bottom: none;
  }
  p {
    margin: 0;
    color: white;
  }
`;

export default Page;
