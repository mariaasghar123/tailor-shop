import React, { useEffect, useState } from 'react';
import { db, auth } from '../../../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ShopsList = () => {
  const [shops, setShops] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, 'shops'),
      where('ownerId', '==', auth.currentUser.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      let data = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() });
      });
      setShops(data);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure to delete this shop?')) {
      await deleteDoc(doc(db, 'shops', id));
      toast.success('Shop Deleted');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800">My Shops</h2>
          <button
            onClick={() => navigate('/create_shop')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            + Add New Shop
          </button>
        </div>

        {/* Shops Grid */}
        {shops.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            You don’t have any shops yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition"
              >
                {/* Image */}
                <img
                  src={shop.image || 'https://via.placeholder.com/400x250'}
                  alt={shop.name}
                  className="w-full h-48 object-cover"
                />

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {shop.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2">
                    {shop.location}
                  </p>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {shop.description}
                  </p>
                  <p className="text-yellow-500 font-medium mb-4">
                    ★ Rating: {shop.rating || 0}
                  </p>

                  {/* Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/shop_detail/${shop.id}`)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/owner/${shop.id}/edit`)}
                      className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(shop.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopsList;
