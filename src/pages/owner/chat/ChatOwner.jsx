import React, { useEffect, useState } from 'react';
import { db, auth } from '../../../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useParams } from 'react-router-dom';

const OwnerChat = () => {
  // ✅ only from URL
  const { chatId } = useParams(); 

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [ownerId, setOwnerId] = useState(null);

  // Set owner ID once auth is ready
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) setOwnerId(user.uid);
      else setOwnerId(null);
    });
    return unsubscribe;
  }, []);

  // Listen for messages
  useEffect(() => {
    if (!chatId) return;

    const ref = collection(db, 'chats', chatId, 'messages');
    const q = query(ref, orderBy('createdAt', 'asc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(data);
    }, (err) => console.error('onSnapshot error:', err));

    return () => unsub();
  }, [chatId]);

  const sendMessage = async () => {
    if (!chatId) {
      console.error('chatId is not defined');
      return;
    }
    if (!newMessage.trim()) return;
    if (!ownerId) {
      console.error('Owner not logged in');
      return;
    }

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: newMessage.trim(),
        senderId: ownerId,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col max-w-3xl mx-auto h-[80vh] bg-white shadow rounded">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No messages yet</p>
        ) : (
          messages.map((msg) => {
            const isOwner = msg.senderId === ownerId;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwner ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-xs break-words ${
                    isOwner
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <span className="text-[10px] opacity-70 block text-right">
                    {msg.createdAt && msg.createdAt.toDate
                      ? msg.createdAt.toDate().toLocaleTimeString()
                      : '...'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input area */}
      <div className="flex border-t p-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          className="flex-1 border rounded-l px-3 py-2 focus:outline-none"
          placeholder="Type your reply..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default OwnerChat;
