// ... same imports above
import React, { useEffect, useState } from 'react';
import { db, auth } from '../../../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs
} from 'firebase/firestore';
import ViewOrder from './ViewOrder'; // 🔹 import the modal you already built

const AllOrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tailors, setTailors] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 🔹 Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch owner's shops
        const shopsSnap = await getDocs(
          query(
            collection(db, 'shops'),
            where('ownerId', '==', auth.currentUser.uid)
          )
        );

        const shops = shopsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const shopIds = shops.map(s => s.id);

        if (shopIds.length === 0) {
          setOrders([]);
          setLoading(false);
          return;
        }

        // Fetch orders for owner's shops
        const q = query(
          collection(db, 'orders'),
          where('shopId', 'in', shopIds),
          orderBy('createdAt', 'desc')
        );

        const unsub = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => {
            const order = doc.data();
            const shop = shops.find(s => s.id === order.shopId);
            return {
              id: doc.id,
              shopName: shop?.name || order.shopName || order.shopId,
              ...order,
            };
          });
          setOrders(data);
          setLoading(false);
        });

        return () => unsub();
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // 🔹 Fetch Tailors (role = 'tailor')
  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'tailor'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTailors(data);
    });
    return () => unsub();
  }, []);

  if (loading) return <p className="text-center py-10 text-indigo-700 font-semibold">Loading orders...</p>;

  return (
    <div className="max-w-[100rem] mx-auto p-6">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-indigo-800">All Orders</h2>

      <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-indigo-300">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-indigo-100 text-left text-indigo-900 uppercase tracking-wide text-sm font-semibold">
              <th className="p-4 border-b border-indigo-300">Shop</th>
              <th className="p-4 border-b border-indigo-300">Customer Phone</th>
              <th className="p-4 border-b border-indigo-300">Service</th>
              <th className="p-4 border-b border-indigo-300">Type</th>
              <th className="p-4 border-b border-indigo-300">Size / Measurements</th>
              <th className="p-4 border-b border-indigo-300">Price</th>
              <th className="p-4 border-b border-indigo-300">Status</th>
              <th className="p-4 border-b border-indigo-300">Progress</th> {/* 🟩 NEW */}
              <th className="p-4 border-b border-indigo-300">Created</th>
              <th className="p-4 border-b border-indigo-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr
                key={order.id}
                className={`border-b border-indigo-200 transition-colors duration-300 ${idx % 2 === 0 ? 'bg-indigo-50' : 'bg-white'} hover:bg-indigo-100`}
              >
                <td className="p-4 font-medium text-indigo-700">{order.shopName}</td>
                <td className="p-4 text-indigo-600">{order.phone}</td>
                <td className="p-4 text-indigo-700">
                  {order.service?.name || order.serviceName}
                </td>
                <td className="p-4 capitalize text-indigo-700">{order.type}</td>

                <td className="p-4 text-indigo-600 text-sm">
                  {order.type === 'standard' && (
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-semibold">
                      Size: {order.template || order.size || '—'}
                    </span>
                  )}
                  {order.type === 'custom' &&
                    Array.isArray(order.measurements) &&
                    order.measurements.length > 0 && (
                      <div className="space-y-1">
                        {order.measurements.map((m, i) => (
                          <p key={i} className="font-mono">{m}</p>
                        ))}
                      </div>
                    )}
                </td>

                <td className="p-4 text-indigo-800 font-semibold">
                  ${order.basePrice?.toFixed(2)}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${
                      order.status === 'Received'
                        ? 'bg-blue-600'
                        : order.status === 'In Progress'
                        ? 'bg-yellow-500'
                        : order.status === 'Completed'
                        ? 'bg-green-600'
                        : 'bg-gray-500'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                {/* 🟩 Progress Column */}
                <td className="p-4 w-48">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-indigo-100 h-2 rounded-full">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${order.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-indigo-700 font-semibold w-10">
                      {order.progress || 0}%
                    </span>
                  </div>
                </td>

                <td className="p-4 text-indigo-500 text-sm font-mono">
                  {order.createdAt?.toDate
                    ? order.createdAt.toDate().toLocaleString()
                    : '—'}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500 text-sm"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center text-indigo-500 py-10 text-lg">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Modal for viewing order detail */}
      {selectedOrder && (
        <ViewOrder
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          tailors={tailors} 
          onAssignTailor={(tailorId) => {
            console.log('Assign tailor', tailorId, 'to order', selectedOrder.id);
          }}
        />
      )}
    </div>
  );
};

export default AllOrdersList;
