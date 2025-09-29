import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom'; // <-- navigate import
import { toast } from 'react-toastify';

const ViewShop = () => {
  const { id } = useParams(); // URL se shop ID
  const navigate = useNavigate(); // <-- hook for navigation
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  // new service form
  const [serviceName, setServiceName] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [templateSizes, setTemplateSizes] = useState('S,M,L,XL');

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const docRef = doc(db, 'shops', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setShop({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load shop');
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [id]);

  // add new service
  const handleAddService = async () => {
    if (!serviceName || !basePrice) {
      toast.error('Please fill all fields');
      return;
    }

    const newService = {
      name: serviceName,
      basePrice: Number(basePrice),
      serviceID: 'svc' + Date.now(),
      templates: templateSizes.split(',').map((s) => s.trim())
    };

    try {
      const shopRef = doc(db, 'shops', id);
      await updateDoc(shopRef, {
        services: arrayUnion(newService)
      });
      toast.success('Service added');
      setShop({
        ...shop,
        services: [...(shop.services || []), newService]
      });
      setServiceName('');
      setBasePrice('');
      setTemplateSizes('S,M,L,XL');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add service');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!shop) return <div className="p-6">Shop not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Shop details */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <img
            src={shop.image || 'https://via.placeholder.com/600x250'}
            alt={shop.name}
            className="w-full h-64 object-cover"
          />
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{shop.name}</h1>
            <p className="text-gray-500">{shop.location}</p>
            <p className="text-gray-500">Phone: {shop.phone}</p>
            <p className="text-yellow-500 font-medium mb-3">
              ★ Rating: {shop.rating || 0}
            </p>
            <p className="text-gray-700">{shop.description}</p>

            {/* View Orders button */}
            <button
              onClick={() => navigate(`/order_detail/${shop.id}`)} // navigate to orders page
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              View Orders
            </button>
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Services
          </h2>

          {/* Existing services */}
          {shop.services && shop.services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {shop.services.map((svc, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-bold text-gray-700 mb-1">
                    {svc.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-1">
                    Base Price: ${svc.basePrice}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Templates: {svc.templates?.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-6">No services added yet.</p>
          )}

          {/* Add new service form */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Add New Service</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Service Name"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="border rounded p-2 w-full"
              />
              <input
                type="number"
                placeholder="Base Price"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="border rounded p-2 w-full"
              />
              <input
                type="text"
                placeholder="Templates (comma separated)"
                value={templateSizes}
                onChange={(e) => setTemplateSizes(e.target.value)}
                className="border rounded p-2 w-full"
              />
            </div>
            <button
              onClick={handleAddService}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              + Add Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewShop;
