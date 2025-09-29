import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
  getDocs
} from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import ViewOrder from './ViewOrder';

const OrderList = () => {
  const { shopId } = useParams();
  const [orders, setOrders] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 🔹 Assign Tailor
  const assignTailor = async (orderId, tailorId) => {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      tailorId: tailorId,
      status: 'Assigned'
    });
    alert('Tailor assigned successfully');
  };

  // 🔹 Fetch Orders
  useEffect(() => {
    if (!shopId) return;

    const q = query(
      collection(db, 'orders'),
      where('shopId', '==', shopId),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
      setLoading(false);
    });

    return () => unsub();
  }, [shopId]);

  // 🔹 Fetch Tailors
  useEffect(() => {
    const fetchTailors = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'tailor'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTailors(data);
      } catch (err) {
        console.error('Error fetching tailors:', err);
      }
    };
    fetchTailors();
  }, []);

  // 🔹 Status Change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // 🔹 Progress Change
  const handleProgressChange = async (orderId, newProgress) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        progress: Number(newProgress),
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // 🔹 Delete Handler
  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  if (loading) return <p className="text-center py-10 text-gray-600">Loading orders...</p>;

  return (
    <div className="max-w-[100rem] mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Orders for Shop</h2>

      <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-200">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
              <th className="p-4 text-left">Customer Phone</th>
              <th className="p-4 text-left">Service</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Size / Measurements</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Progress</th> {/* 🔹 new column */}
              <th className="p-4 text-left">Tailor</th>
              <th className="p-4 text-left">Created</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => {
              const assignedTailor = tailors.find((t) => t.id === order.tailorId);

              return (
                <tr key={order.id} className="hover:bg-indigo-50 transition-colors duration-150">
                  <td className="p-4 font-medium text-gray-700">{order.phone}</td>
                  <td className="p-4 text-gray-600">{order.service?.name || order.serviceName}</td>
                  <td className="p-4 capitalize text-gray-600">{order.type}</td>

                  <td className="p-4">
                    {order.type === 'standard' && (
                      <span className="inline-block text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                        Size: {order.template || order.size || '—'}
                      </span>
                    )}
                    {order.type === 'custom' &&
                      order.measurements &&
                      Array.isArray(order.measurements) && (
                        <div className="text-xs text-gray-500 space-y-0.5">
                          {order.measurements.map((m, i) => (
                            <p key={i}>{m}</p>
                          ))}
                        </div>
                      )}
                  </td>

                  <td className="p-4 text-gray-700 font-semibold">${order.basePrice}</td>

                  <td className="p-4">
                    <select
                      value={order.status || 'Pending'}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>

                  {/* 🔹 Progress Input */}
                  <td className="p-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={order.progress || 0}
                      onChange={(e) => handleProgressChange(order.id, e.target.value)}
                      className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center"
                    />
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${order.progress || 0}%` }}
                      ></div>
                    </div>
                  </td>

                  <td className="p-4">
                    {assignedTailor ? (
                      <span className="inline-block text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {assignedTailor.name || assignedTailor.email}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Not Assigned</span>
                    )}
                  </td>

                  <td className="p-4 text-sm text-gray-500">
                    {order.createdAt?.toDate
                      ? order.createdAt.toDate().toLocaleString()
                      : '—'}
                  </td>

                  <td className="p-4 space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm shadow-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm shadow-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {orders.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center text-gray-500 py-6">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <ViewOrder
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        tailors={tailors}
        onAssignTailor={assignTailor}
      />
    </div>
  );
};

export default OrderList;
