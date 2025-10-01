import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

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

  const createdAtFormatted = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleString()
    : order.createdAt || 'N/A';

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-purple-700 via-pink-500 to-blue-400 font-sans">
      <div className="overflow-x-auto"></div>
      <div className="w-full max-w-full sm:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-3xl shadow-2xl p-6 sm:p-8 overflow-x-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-purple-700 text-center sm:text-left">
          Order Details
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          <p className="break-words"><span className="font-semibold text-purple-600">Order ID:</span> {order.id}</p>
          <p className="break-words"><span className="font-semibold text-purple-600">Shop ID:</span> {order.shopId}</p>
          <p className="break-words"><span className="font-semibold text-purple-600">Shop Name:</span> {order.shopName}</p>
          <p className="break-words"><span className="font-semibold text-purple-600">Phone:</span> {order.phone}</p>
          <p className="break-words"><span className="font-semibold text-purple-600">Status:</span> {order.status}</p>
          <p className="break-words"><span className="font-semibold text-purple-600">Type:</span> {order.type}</p>
          <p className="sm:col-span-2 break-words"><span className="font-semibold text-purple-600">Address:</span> {order.address}</p>
          <p className="break-words"><span className="font-semibold text-purple-600">Price:</span> ${order.basePrice}</p>
          <p className="sm:col-span-2 break-words"><span className="font-semibold text-purple-600">Created At:</span> {createdAtFormatted}</p>
        </div>

        {/* Standard Order */}
        {order.type === 'standard' && (
          <div className="mt-6 p-4 bg-purple-50 rounded-2xl shadow-inner border-l-4 border-purple-500 break-words">
            <p><span className="font-semibold text-purple-600">Size:</span> {order.template}</p>
          </div>
        )}

        {/* Custom Order */}
        {order.type === 'custom' && (
          <div className="mt-6 p-4 bg-purple-50 rounded-2xl shadow-inner border-l-4 border-pink-500 space-y-3 break-words">
            <h2 className="text-xl sm:text-2xl font-semibold text-pink-600">Measurements</h2>
            {order.measurements ? (
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm sm:text-base">
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
              <div className="mt-3 flex justify-center sm:justify-start">
                <div className="w-40 h-40 sm:w-48 sm:h-48 border rounded-xl shadow-md overflow-hidden">
                  <img
                    src={order.designURL}
                    alt="Design"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {order.notes && (
          <p className="mt-4 text-gray-700 text-sm sm:text-base break-words"><strong>Notes:</strong> {order.notes}</p>
        )}

        {/* Progress Steps */}
        {Array.isArray(order.progress) && order.progress.length > 0 && (
          <div className="mt-6 p-4 bg-indigo-50 rounded-2xl shadow-inner border-l-4 border-indigo-500 break-words">
            <h2 className="text-xl sm:text-2xl font-semibold text-indigo-600 mb-2">Order Progress</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm sm:text-base">
              {order.progress.map((step, index) => (
                <li key={index}>
                  <strong>{step.status}</strong> — {step.time ? new Date(step.time).toLocaleString() : 'No time'}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-center sm:justify-start">
          <Link
            to="/my-orders"
            className="inline-block mt-6 bg-gradient-to-r from-pink-500 to-purple-700 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition transform hover:scale-105 text-sm sm:text-base"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
