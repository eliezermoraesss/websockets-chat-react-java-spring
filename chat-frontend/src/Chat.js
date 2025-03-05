import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [client, setClient] = useState(null);
    const [text, setText] = useState('');

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

    const sendMessage = () => {
        if (client && text.trim() !== '') {
            // Publica mensagem no destino /app/chat
            client.publish({
                destination: '/app/chat',
                body: JSON.stringify({ sender: 'Usuário', content: text }),
            });
            setText('');
        }
    };

    return (
        <div style={{ padding: '20px'}}>
            <h2>Chat em Tempo Real</h2>
            <div style={{
                border: '1px solid #ccc',
                padding: '10px',
                height: '300px',
                overflowY: 'scroll',
                marginBottom: '10px'
            }}>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.sender}:</strong> {msg.content}
                    </div>
                ))}
            </div>
            <input
                type='text'
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Digite sua mensagem..."
                style={{ width: '80%', padding: '8px'}}
            />
            <button onClick={sendMessage} style={{ padding: '8px 12px', marginLeft: '10px' }}>
                Enviar
            </button>
        </div>
    );
};

export default Chat;
