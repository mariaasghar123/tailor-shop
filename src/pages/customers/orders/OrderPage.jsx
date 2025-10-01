import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import { Link } from 'react-router-dom';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'orders'),
      where('customerId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        {/* Responsive wrapper for horizontal scroll */}
        <div className="bg-white shadow-md rounded-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="py-3 px-4 text-left whitespace-nowrap">Shop</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Size</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Phone</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Progress</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Date</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => {
                  const statusText =
                    typeof order.status === 'object'
                      ? order.status?.status
                      : order.status;
                  const progressValue =
                    typeof order.progress === 'object'
                      ? order.progress?.value
                      : order.progress;

                  return (
                    <tr key={order.id} className="border-b">
                      <td className="py-3 px-4 whitespace-nowrap">{order.shopName || '-'}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{order.template || '-'}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{order.phone || '-'}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            statusText === 'Completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {statusText || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${progressValue || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{progressValue || 0}%</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {order.createdAt?.toDate
                          ? order.createdAt.toDate().toLocaleDateString()
                          : ''}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Link
                          to={`/my-orders/${order.id}`}
                          className="text-indigo-600 hover:underline"
                        >
                          View Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
