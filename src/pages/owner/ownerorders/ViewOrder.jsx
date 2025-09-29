import React, { useEffect, useState } from 'react';

const ViewOrder = ({ order, onClose, tailors = [], onAssignTailor }) => {
  const [selectedTailor, setSelectedTailor] = useState('');
  const [assigning, setAssigning] = useState(false);

  // jab modal open ho to agar order pe pehle se tailor assigned ho to select ko set kar do
  useEffect(() => {
    setSelectedTailor(order?.tailorId || '');
  }, [order]);

  // Normalize measurements so we never call .map on a non-array
  const normalizeMeasurements = (m) => {
    if (!m) return null; // no measurements
    if (Array.isArray(m)) return m.length ? m : null; // empty array -> treat as none
    if (typeof m === 'object') {
      // object -> convert to array of "key: value"
      return Object.entries(m).map(([k, v]) => `${k}: ${String(v)}`);
    }
    // string/number -> wrap into array
    return [String(m)];
  };

  const measurements = normalizeMeasurements(order?.measurements);

  const handleAssign = async () => {
    if (!selectedTailor) {
      alert('Please select a tailor first.');
      return;
    }
    try {
      setAssigning(true);
      await onAssignTailor(order.id, selectedTailor);
      // parent already updates Firestore; keep local UX responsive
    } catch (err) {
      console.error('Assign error:', err);
      alert('Something went wrong while assigning tailor.');
    } finally {
      setAssigning(false);
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Order Details</h3>

        <p><strong>Customer Phone:</strong> {order.phone || '—'}</p>
        <p><strong>Service:</strong> {order.service?.name || order.serviceName || '—'}</p>
        <p><strong>Type:</strong> {order.type || '—'}</p>
        <p><strong>Price:</strong> ${order.basePrice ?? '—'}</p>
        <p><strong>Status:</strong> {order.status || '—'}</p>
        <p><strong>Created:</strong> {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : '—'}</p>

        {/* Measurements (safe) */}
        {order.type === 'custom' && (
          <div className="mt-3">
            <strong>Measurements:</strong>
            {measurements ? (
              <ul className="list-disc ml-5 mt-1 text-sm text-gray-700">
                {measurements.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm mt-1">No measurements provided.</p>
            )}
          </div>
        )}

        {/* 🔹 Tailor Assign Section */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Assign Tailor</label>
          <select
            value={selectedTailor}
            onChange={(e) => setSelectedTailor(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          >
            <option value="">Select a tailor</option>
            {tailors.length > 0 ? (
              tailors.map((tailor) => (
                <option key={tailor.id} value={tailor.id}>
                  {tailor.name || tailor.email || tailor.id}
                </option>
              ))
            ) : (
              <option disabled>No tailors available</option>
            )}
          </select>

          <button
            onClick={handleAssign}
            disabled={assigning}
            className={`mt-3 px-4 py-2 w-full rounded text-white ${assigning ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-500'}`}
          >
            {assigning ? 'Assigning...' : 'Assign Tailor'}
          </button>
        </div>

        <div className="text-right mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOrder;
