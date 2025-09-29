import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const TailorOrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchOrder = async () => {
      const docRef = doc(db, "orders", orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const orderData = docSnap.data();
        setOrder(orderData);
        setProgress(orderData.progress || 0);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleProgressUpdate = async () => {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { progress });
    alert("Progress updated!");
  };

  // Measurements handle
  const getMeasurements = () => {
    if (order?.measurements) {
      if (
        typeof order.measurements === "object" &&
        !Array.isArray(order.measurements)
      ) {
        return Object.entries(order.measurements).map(([part, value]) => ({
          part,
          value,
        }));
      }
      if (Array.isArray(order.measurements)) {
        return order.measurements.map((m) =>
          typeof m === "string" ? { part: m, value: "" } : m
        );
      }
    }
    return [];
  };

  if (!order)
    return (
      <div className="p-6 text-center text-indigo-600 font-semibold text-lg">
        Loading…
      </div>
    );

  const measurementsArray = getMeasurements();
  const serviceName =
    order?.service?.name || order?.service?.serviceName || "No Service Name";

  let createdAt = "N/A";
  if (order?.createdAt?.toDate) {
    createdAt = order.createdAt.toDate().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } else if (order?.createdAt) {
    createdAt = String(order.createdAt);
  }

  return (
    <div className="max-w-5xl mx-auto my-10 bg-white rounded-2xl p-10 shadow-xl border border-indigo-100">
      <h1 className="text-4xl font-extrabold mb-8 text-indigo-700 flex items-center gap-2">
        <span className="w-2 h-10 bg-indigo-600 rounded-md inline-block"></span>
        Order Details
      </h1>

      {/* ORDER INFO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-800">
        <div className="space-y-3">
          <p>
            <span className="font-semibold text-indigo-700">Customer ID:</span>{" "}
            {order?.customerId || "Unknown"}
          </p>
          <p>
            <span className="font-semibold text-indigo-700">Tailor ID:</span>{" "}
            {order?.tailorId || "No tailor assigned"}
          </p>
          <p>
            <span className="font-semibold text-indigo-700">Order Date:</span>{" "}
            {createdAt}
          </p>
          <p>
            <span className="font-semibold text-indigo-700">Phone:</span>{" "}
            {order?.phone || "N/A"}
          </p>
          <p>
            <span className="font-semibold text-indigo-700">Notes:</span>{" "}
            {order?.notes || "No notes available"}
          </p>
          <p>
            <span className="font-semibold text-indigo-700">Service Name:</span>{" "}
            {serviceName}
          </p>
        </div>

        <div className="space-y-3">
          <p>
            <span className="font-semibold text-indigo-700">Address:</span>{" "}
            {order?.address || "No address provided"}
          </p>
          <p>
            <span className="font-semibold text-indigo-700">Shop Name:</span>{" "}
            {order?.shopName || "No shop name"}
          </p>
        </div>
      </div>

      {/* MEASUREMENTS */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-indigo-700 mb-5 border-l-4 border-indigo-600 pl-3">
          Measurements / Size
        </h2>
        {measurementsArray.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {measurementsArray.map((m, idx) => (
              <div
                key={idx}
                className="bg-indigo-50 text-indigo-800 px-4 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition"
              >
                {m.part}: <span className="font-semibold">{m.value || "—"}</span>
              </div>
            ))}
          </div>
        ) : order?.template ? (
          <p className="text-gray-700 text-lg">
            <span className="font-semibold">Selected Size:</span>{" "}
            {order.template}
          </p>
        ) : (
          <p className="text-gray-500 italic">
            No measurements or size available
          </p>
        )}
      </section>

      {/* PROGRESS */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-indigo-700 mb-5 border-l-4 border-indigo-600 pl-3">
          Progress
        </h2>
        <div className="flex items-center space-x-6">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="flex-grow h-3 rounded-lg appearance-none bg-indigo-200 cursor-pointer accent-indigo-600"
          />
          <span className="w-14 text-indigo-700 font-bold text-right">
            {progress}%
          </span>
        </div>
        <button
          onClick={handleProgressUpdate}
          className="mt-6 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-semibold py-3 px-8 rounded-xl transition-transform transform hover:-translate-y-1 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Update Progress
        </button>
      </section>
    </div>
  );
};

export default TailorOrderDetail;
