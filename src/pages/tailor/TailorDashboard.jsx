import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebase"; 
import { useNavigate } from "react-router-dom";

const TailorDashboard = () => {
  const [user, setUser] = useState(null); 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1️⃣ Auth State Change
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
    });
    return unsub;
  }, [navigate]);

  // 2️⃣ Assigned Orders Fetch
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), where("tailorId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
      setLoading(false);
    });

    return unsub;
  }, [user]);

  if (loading)
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="ml-3 text-indigo-600 font-semibold text-lg">Loading orders…</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-6">
      <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-8">
        ✂️ Tailor Dashboard
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg italic">
            No orders assigned yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order, idx) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl border border-indigo-200 transition-transform transform hover:-translate-y-1 hover:scale-[1.02] p-6 relative overflow-hidden"
            >
              {/* top colored bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

              <h2 className="text-xl font-bold text-indigo-700 mb-1">
                {order.customerName || "Customer"}
              </h2>
              <p className="text-sm text-gray-500 mb-3">
                Order ID: {order.id.slice(0, 6)}…
              </p>

              <div className="space-y-2 text-gray-700">
                <p>
                  <span className="font-semibold text-indigo-600">Status:</span>{" "}
                  {order.status || "Pending"}
                </p>
                <p>
                  <span className="font-semibold text-indigo-600">Progress:</span>{" "}
                  <span className="text-green-600 font-bold">
                    {order.progress || 0}%
                  </span>
                </p>
              </div>

              <div className="w-full bg-indigo-100 rounded-full h-2 mt-3">
                <div
                  className="bg-indigo-500 h-2 rounded-full"
                  style={{ width: `${order.progress || 0}%` }}
                ></div>
              </div>

              <button
                onClick={() => navigate(`/tailor/orders/${order.id}`)}
                className="mt-5 w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-colors font-semibold shadow"
              >
                View Order Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TailorDashboard;
