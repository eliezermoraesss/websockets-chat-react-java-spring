import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import 'bootstrap/dist/css/bootstrap.min.css';
import moment from 'moment';

// Obter o nome do usuário da variável de ambiente ou usar "Usuário" como fallback
const username = process.env.REACT_APP_USERNAME || "Usuário";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [client, setClient] = useState(null);
  const [text, setText] = useState('');
  const messageEndRef = useRef(null);

  useEffect(() => {
    // Conecta ao endpoint WebSocket do back-end
    const socket = new SockJS('http://192.175.175.201:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Conectado ao WebSocket!');
        // Inscreve-se no tópico para receber mensagens
        stompClient.subscribe('/topic/messages', (message) => {
          const msg = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, msg]);
        });
      },
      onStompError: (frame) => {
        console.log('Erro no broker: ', frame.headers['message']);
      },
    });
    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, []);

  // Rolagem automática para a última mensagem
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Enviar mensagem ao pressionar Enter (sem Shift)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (client && text.trim() !== '') {
      // Cria o objeto de mensagem com dados de auditoria e status de leitura
      const newMessage = {
        sender: username,
        content: text,
        timestamp: new Date(),
        read: false, // status inicial: não lida
      };

      // Publica a mensagem no destino /app/chat
      client.publish({
        destination: '/app/chat',
        body: JSON.stringify(newMessage),
      });

      // Para efeito de demo, adiciona a mensagem ao estado (ou aguarde retorno do servidor)
      setMessages((prev) => [...prev, newMessage]);
      setText('');
    }
  };

  return (
    <div className="container p-3">
      <h2>Chat em Tempo Real</h2>
      <div 
        className="chat-window border rounded p-3 mb-3" 
        style={{ height: '70vh', overflowY: 'auto' }}
      >
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`d-flex mb-2 ${msg.sender === username ? 'justify-content-end' : 'justify-content-start'}`}
          >
            <div 
              className={`p-2 rounded ${msg.sender === username ? 'bg-primary text-white' : 'bg-light text-dark'}`} 
              style={{ maxWidth: '70%' }}
            >
              <p className="mb-1">{msg.content}</p>
              <div className="d-flex justify-content-between small">
                <span>{moment(msg.timestamp).format('DD/MM/YYYY HH:mm')}</span>
                {msg.sender === username && (
                  <span>{msg.read ? 'Lida' : 'Não lida'}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <div>
        <textarea 
          className="form-control" 
          rows="3" 
          placeholder="Digite sua mensagem..." 
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className="btn btn-primary mt-2" 
          onClick={sendMessage}
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Chat;
