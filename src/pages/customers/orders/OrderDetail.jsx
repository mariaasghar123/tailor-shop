import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; // apna path check karna

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() });
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-400">
        <p className="text-white text-lg animate-pulse">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 via-pink-500 to-purple-600">
        <p className="text-white text-lg font-semibold animate-pulse">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-purple-700 via-pink-500 to-blue-400 text-gray-900 font-sans">
      <div className="max-w-3xl mx-auto px-6 bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-4xl font-extrabold mb-6 text-purple-700">Order Details</h1>

        <div className="space-y-3 text-gray-700">
          <p><span className="font-semibold text-purple-600">Order ID:</span> {order.id}</p>
          <p><span className="font-semibold text-purple-600">Shop ID:</span> {order.shopId}</p>
          <p><span className="font-semibold text-purple-600">Shop Name:</span> {order.shopName}</p>
          <p><span className="font-semibold text-purple-600">Phone:</span> {order.phone}</p>
          <p><span className="font-semibold text-purple-600">Status:</span> {order.status}</p>
          <p><span className="font-semibold text-purple-600">Type:</span> {order.type}</p>
          <p><span className="font-semibold text-purple-600">Address:</span> {order.address}</p>
          <p><span className="font-semibold text-purple-600">Price:</span> ${order.basePrice}</p>
          <p><span className="font-semibold text-purple-600">Created At:</span> {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : ''}</p>
        </div>

        {/* Standard Order */}
        {order.type === 'standard' && (
          <div className="mt-6 p-4 bg-purple-50 rounded-2xl shadow-inner border-l-4 border-purple-500">
            <p><span className="font-semibold text-purple-600">Size:</span> {order.template}</p>
          </div>
        )}

        {/* Custom Order */}
        {order.type === 'custom' && (
          <div className="mt-6 p-4 bg-purple-50 rounded-2xl shadow-inner border-l-4 border-pink-500 space-y-3">
            <h2 className="text-xl font-semibold text-pink-600">Measurements</h2>
            {order.measurements ? (
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><strong>Chest:</strong> {order.measurements.chest}</li>
                <li><strong>Waist:</strong> {order.measurements.waist}</li>
                <li><strong>Hips:</strong> {order.measurements.hips}</li>
                <li><strong>Sleeve:</strong> {order.measurements.sleeve}</li>
                <li><strong>Length:</strong> {order.measurements.length}</li>
              </ul>
            ) : (
              <p className="text-gray-500">No measurements available</p>
            )}

            {order.designURL && (
              <div className="mt-3">
                <h3 className="text-lg font-medium text-pink-600">Design Image:</h3>
                <img
                  src={order.designURL}
                  alt="Design"
                  className="mt-2 w-40 h-40 object-cover border rounded-xl shadow-md"
                />
              </div>
            )}
          </div>
        )}

        {order.notes && (
          <p className="mt-4 text-gray-700"><strong>Notes:</strong> {order.notes}</p>
        )}

        {/* Progress Steps */}
        {Array.isArray(order.progress) && order.progress.length > 0 && (
          <div className="mt-6 p-4 bg-indigo-50 rounded-2xl shadow-inner border-l-4 border-indigo-500">
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">Order Progress</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {order.progress.map((step, index) => (
                <li key={index}>
                  <strong>{step.status}</strong> — {step.time ? new Date(step.time).toLocaleString() : 'No time'}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          to="/my-orders"
          className="inline-block mt-6 bg-gradient-to-r from-pink-500 to-purple-700 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition transform hover:scale-105"
        >
          Back to Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderDetail;
