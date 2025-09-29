import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  where
} from "firebase/firestore";
import { db, auth } from '../../../firebase'
import OrderModal from '../orders/OrderModel';

const ShopPage = () => {
  const { shopId } = useParams()
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const currentUserId = auth.currentUser?.uid;
  const [showOrderModal, setShowOrderModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!shopId) return;
    const fetchShop = async () => {
      try {
        const docRef = doc(db, 'shops', shopId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setShop({ id: docSnap.id, ...docSnap.data() })
        } else {
          setShop(null)
        }
      } catch (err) {
        console.error('Error fetching shop:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchShop()
  }, [shopId])

  useEffect(() => {
    if (!shopId || !currentUserId) return;
    const chatDocId = `${shopId}_${currentUserId}`;
    const q = query(
      collection(db, "chats", chatDocId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [shopId, currentUserId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;
    try {
      const chatDocId = `${shopId}_${currentUserId}`;
      await addDoc(collection(db, "chats", chatDocId, "messages"), {
        text: newMessage,
        senderId: currentUserId,
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  useEffect(() => {
    if (!shopId) return;
    const q = query(
      collection(db, "reviews"),
      where("shopId", "==", shopId),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [shopId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error("Please login to add a review");
      navigate("/login");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please enter your comment");
      return;
    }
    try {
      await addDoc(collection(db, "reviews"), {
        shopId,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "Anonymous",
        rating: Number(rating),
        comment,
        createdAt: serverTimestamp()
      });
      setComment("");
      toast.success("Review added!");
    } catch (err) {
      console.error("Error adding review:", err);
      toast.error("Failed to add review");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-indigo-700">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-300"></div>
    </div>;
  }

  if (!shop) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-pink-600">
      <h2 className="text-3xl font-extrabold text-white animate-pulse">Shop Not Found</h2>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-500 to-pink-100 text-white font-sans selection:bg-pink-500 selection:text-white">
      {/* Header Banner */}
      <header className="relative overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
          <img
            src={shop.image}
            alt={shop.name}
            className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
          />
          <div className="flex-1 space-y-4">
            <h1 className="text-6xl font-extrabold tracking-wide drop-shadow-lg animate-popIn">{shop.name}</h1>
            <p className="opacity-80 text-lg flex items-center gap-2 animate-fadeIn delay-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7" /></svg>
              {shop.location}
            </p>
            {/* <p className="text-2xl font-semibold text-pink-400 animate-fadeIn delay-400">Rating ★ {shop.rating}</p> */}
            <p className="max-w-xl leading-relaxed mt-4 text-indigo-100">{shop.description}</p>
          </div>
        </div>
        <div className="absolute -top-20 -right-20 rounded-full bg-pink-500 opacity-40 blur-3xl w-64 h-64 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 rounded-full bg-indigo-700 opacity-30 blur-3xl w-96 h-96"></div>
      </header>

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 pb-20">
        {/* Left Section: Reviews + Review Form */}
        <section className="md:col-span-3 space-y-12">
          {/* Reviews */}
          <div className="bg-indigo-800 bg-opacity-60 rounded-3xl p-10 shadow-xl backdrop-blur-sm">
            <h2 className="text-4xl font-extrabold mb-8 border-b border-pink-500 pb-3">Customer Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-pink-300 italic">No reviews yet. Share your experience!</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="mb-6 p-6 rounded-xl bg-gradient-to-r from-pink-900 to-purple-900 shadow-lg border border-pink-600 transform hover:scale-105 transition-transform duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-xl text-pink-400">{r.userName}</h3>
                    <span className="text-yellow-400 text-xl font-bold">★ {r.rating}</span>
                  </div>
                  <p className="text-indigo-300 leading-relaxed whitespace-pre-line">{r.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Review */}
          <div className="bg-indigo-800 bg-opacity-60 rounded-3xl p-10 shadow-xl backdrop-blur-sm">
            <h2 className="text-4xl font-extrabold mb-8 border-b border-pink-500 pb-3">Add Your Review</h2>
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div>
                <label htmlFor="rating" className="block mb-2 font-semibold text-pink-400 text-lg">Rating</label>
                <select
                  id="rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full rounded-2xl px-5 py-3 bg-indigo-900 border border-pink-500 text-pink-300 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>{num} Star{num > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="comment" className="block mb-2 font-semibold text-pink-400 text-lg">Comment</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Write your experience here..."
                  className="w-full rounded-2xl px-5 py-3 bg-indigo-900 border border-pink-500 text-pink-300 font-medium focus:outline-none focus:ring-2 focus:ring-pink-400 transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-purple-700 hover:to-pink-700 hover:from-purple-600 text-white font-extrabold rounded-full px-12 py-4 w-full shadow-lg transform hover:scale-105 transition-transform duration-300"
              >
                Submit Review
              </button>
            </form>
          </div>
        </section>

        {/* Right Section: Services + Order + Chat */}
        <aside className=" space-y-12 flex flex-col">
          {/* Services */}
          <div className="bg-indigo-800 bg-opacity-60 rounded-3xl p-8 shadow-xl backdrop-blur-sm">
            <h2 className="text-3xl font-extrabold mb-8 border-b border-pink-500 pb-3">Available Services</h2>
            {shop.services && shop.services.length > 0 ? (
              <ul className="space-y-5">
                {shop.services.map((service, i) => (
                  <li key={i} className="flex justify-between items-center font-semibold text-pink-300 border-b border-purple-700 pb-2 hover:text-pink-500 cursor-pointer transition-colors duration-300">
                    <span>{service.name}</span>
                    <span className="text-lg">
  ${(service.basePrice || 0).toFixed(2)}
</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic text-pink-300">No services currently available.</p>
            )}
          </div>

          {/* Order Button */}
          <div>
            <button
              onClick={() => {
                if (!auth.currentUser) {
                  toast.info("Please login to place an order.");
                  navigate('/login');
                  return;
                }
                setShowOrderModal(true);
              }}
              className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-700 to-indigo-700 rounded-full font-bold text-white text-lg shadow-lg hover:scale-110 transform transition-transform duration-300"
            >
              Place Your Order
            </button>
          </div>

          {/* Chat Section */}
          <div className="flex flex-col h-full bg-indigo-800 bg-opacity-50 rounded-3xl p-2 shadow-lg backdrop-blur-sm">
  <h2 className="text-3xl font-extrabold mb-4 border-b border-pink-500 pb-2">Chat with Tailor</h2>

  {/* Messages container */}
  <div className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-thin scrollbar-thumb-pink-600 scrollbar-thumb-rounded">
    {messages.length === 0 ? (
      <p className="text-pink-300 text-center italic select-none mt-10">No messages yet. Say hi!</p>
    ) : (
      messages.map((msg) => (
        <div
          key={msg.id}
          className={`max-w-[80%] px-4 py-2 rounded-2xl shadow break-words
          ${msg.senderId === currentUserId
              ? 'self-end bg-gradient-to-r from-pink-600 to-purple-700 text-white animate-pulse'
              : 'self-start bg-purple-900 text-pink-300'}
          `}
        >
          {msg.text}
        </div>
      ))
    )}
  </div>

  {/* Input + Send button */}
  <form onSubmit={sendMessage} className="space-y-6 gap-2">
    <input
      type="text"
      placeholder="Type a message..."
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      className="flex-grow rounded-full px-1 py-2 bg-indigo-900 border border-pink-600 text-pink-300 placeholder-pink-400 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
    />
    <button
      type="submit"
      className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-700 hover:from-purple-600 hover:to-pink-700 text-white font-bold shadow transition transform hover:scale-105 duration-300"
    >
      Send
    </button>
  </form>
</div>

        </aside>
      </main>

      {showOrderModal && (
        <OrderModal
          shop={shop}
          onClose={(orderId) => {
            setShowOrderModal(false);
            if (orderId) navigate(`/my-orders/${orderId}`);
          }}
        />
      )}

      <style>{`
        /* Keyframe animations */
        @keyframes popIn {
          0% {opacity: 0; transform: scale(0.8);}
          100% {opacity: 1; transform: scale(1);}
        }
        @keyframes fadeIn {
          from {opacity: 0;}
          to {opacity: 1;}
        }
        .animate-popIn {
          animation: popIn 0.6s ease forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 1.2s ease forwards;
        }
        /* Scrollbar styling for chat */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #db2777 transparent;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #db2777;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  )
}

export default ShopPage;
