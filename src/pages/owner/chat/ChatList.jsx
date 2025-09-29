import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';

const ChatList = () => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const chatsRef = collection(db, 'chats');
        const chatsSnapshot = await getDocs(chatsRef);

        const chatData = await Promise.all(
          chatsSnapshot.docs.map(async (chatDoc) => {
            const chatId = chatDoc.id;
            const chatInfo = chatDoc.data();

            const messagesRef = collection(db, 'chats', chatId, 'messages');
            const messagesSnapshot = await getDocs(messagesRef);
            const messages = messagesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            return {
              id: chatId,
              ...chatInfo,
              messages
            };
          })
        );

        setChats(chatData);
      } catch (err) {
        console.error('Error fetching chats:', err);
      }
    };

    fetchChats();
  }, []);

  return (
    <div>
      <h2>All Chats</h2>
      {chats.map(chat => (
        <div key={chat.id} style={{
          border: '1px solid #ccc',
          marginBottom: '16px',
          padding: '16px',
          borderRadius: 8,
          background: "#f9f9f9"
        }}>
          <h3 style={{marginBottom: 8}}>Chat ID: {chat.id}</h3>
          {chat.messages.length > 0 ? (
            <ul>
              {chat.messages.map(msg => (
                <li key={msg.id}>
                  <strong>{msg.senderId}:</strong> {msg.text}
                  {msg.createdAt?.toDate &&
                    <span style={{color:"#888", fontSize:10, marginLeft:8}}>
                      {msg.createdAt.toDate().toLocaleString()}
                    </span>
                  }
                </li>
              ))}
            </ul>
          ) : (
            <p>No messages yet</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatList;
