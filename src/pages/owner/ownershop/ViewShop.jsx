import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// getStorage aur ref abhi rehne dete hain, agar future mein file path se load karna hua to kaam aayenge.

// const storage = getStorage(); // Abhi iski zaroorat nahi hai agar full URL save ho raha hai.

const ViewShop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // imageUrls state ki ab zaroorat nahi hai
  // const [imageUrls, setImageUrls] = useState({}); 
  
  const [serviceName, setServiceName] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [templateSizes, setTemplateSizes] = useState('S,M,L,XL');
const [showAddServiceForm, setShowAddServiceForm] = useState(false);

  // For new service form inputs (like in CreateShop)
  const [newServiceName, setNewServiceName] = useState('');
  const [newBasePrice, setNewBasePrice] = useState('');
  const [newTypes, setNewTypes] = useState(['standard']); // default
  const garmentTypes = ["Shirt", "Pants", "Coat"];
  const [newStandardSizes, setNewStandardSizes] = useState(
    garmentTypes.reduce((acc, g) => {
      acc[g] = { sizes: ['S', 'M', 'L', 'XL'], images: {} };
      return acc;
    }, {})
  );
  const [newCustomMeasurements, setNewCustomMeasurements] = useState([]);
  const [newTemplates, setNewTemplates] = useState(['S', 'M', 'L', 'XL']);

  // Toggle new service types (standard/custom)
  const toggleNewType = (type) => {
    if (newTypes.includes(type)) {
      setNewTypes(newTypes.filter(t => t !== type));
    } else {
      setNewTypes([...newTypes, type]);
    }
  };

  // Handle image URL input changes for standard sizes
  const handleNewImageChange = (garment, size, value) => {
    setNewStandardSizes(prev => ({
      ...prev,
      [garment]: {
        ...prev[garment],
        images: {
          ...prev[garment].images,
          [size]: value
        }
      }
    }));
  };

  // Handle custom measurements change (comma separated)
  const handleCustomMeasurementsChange = (value) => {
    const arr = value.split(',').map(v => v.trim()).filter(Boolean);
    setNewCustomMeasurements(arr);
  };

  // Handle adding new service submit
  const handleAddNewService = async () => {
    if (!newServiceName || !newBasePrice) {
      toast.error('Please fill all fields in New Service form');
      return;
    }
    const newService = {
      serviceID: 'svc' + Date.now(),
      name: newServiceName,
      basePrice: Number(newBasePrice),
      types: newTypes,
      standardSizes: newTypes.includes('standard') ? newStandardSizes : {},
      customMeasurements: newTypes.includes('custom') ? newCustomMeasurements : [],
      templates: newTemplates,
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

      // Reset new service form inputs
      setNewServiceName('');
      setNewBasePrice('');
      setNewTypes(['standard']);
      setNewStandardSizes(
        garmentTypes.reduce((acc, g) => {
          acc[g] = { sizes: ['S', 'M', 'L', 'XL'], images: {} };
          return acc;
        }, {})
      );
      setNewCustomMeasurements([]);
      setNewTemplates(['S', 'M', 'L', 'XL']);
      setShowAddServiceForm(false); // hide form after adding
    } catch (err) {
      console.error(err);
      toast.error('Failed to add new service');
    }
  };
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const docRef = doc(db, 'shops', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setShop(data);
          // fetchImageUrls(data.services || []); // Is function ko hataya
        } else {
            toast.error('Shop document does not exist.');
        }
      } catch (err) {
        console.error("Error fetching shop:", err);
        toast.error('Failed to load shop');
      } finally {
        setLoading(false);
      }
    };

    // fetchImageUrls function ko pura remove kar diya hai
    
    fetchShop();
  }, [id]);

  const handleAddService = async () => {
    if (!serviceName || !basePrice) {
      toast.error('Please fill all fields');
      return;
    }
    const newService = {
      name: serviceName,
      basePrice: Number(basePrice),
      serviceID: 'svc' + Date.now(),
      // Ye templates array ka structure CreateShop se copy kiya gaya hai, zaruri hai ki standardSizes aur types bhi hon agar unka use hai.
      // Lekin aapke form mein woh fields nahi hain, isliye abhi sirf yahi add ho raha hai.
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

  if (loading) return <div className="p-6 text-center text-indigo-700 font-semibold text-lg">Loading...</div>;
  if (!shop) return <div className="p-6 text-center text-red-600 font-semibold">Shop not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Shop details */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-10">
          <img
            src={shop.image || 'https://via.placeholder.com/600x250'}
            alt={shop.name}
            className="w-full h-64 object-cover"
          />
          <div className="p-8">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2">{shop.name}</h1>
            <p className="text-gray-600 text-lg mb-1">{shop.location}</p>
            <p className="text-gray-600 text-lg mb-3">Phone: {shop.phone}</p>
            <p className="text-yellow-500 font-semibold text-lg mb-6">★ Rating: {shop.rating || 0}</p>
            <p className="text-gray-700 text-lg">{shop.description}</p>

            {/* View Orders button */}
            <button
              onClick={() => navigate(`/order_detail/${shop.id}`)}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg shadow-md transition focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              View Orders
            </button>
          </div>
        </div>

        {/* Services Section */}
       {/* Services Section */}
<section className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">Services</h2>

      {/* Existing services display - no change */}
       {shop.services && shop.services.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
      {shop.services.map((svc, idx) => (
        <div
          key={idx}
          className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition bg-gray-50"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">{svc.name}</h3>
          <p className="text-gray-700 mb-2 font-semibold">Base Price: ${svc.basePrice}</p>


          {svc.types && (
            <p className="mb-2 text-gray-600"><strong>Types:</strong> {svc.types.join(', ')}</p>
          )}


          {/* Custom Measurements */}
          {svc.types?.includes("custom") && svc.customMeasurements?.length > 0 && (
            <div className="mb-2 text-gray-600">
              <strong>Custom Measurements:</strong>
              <ul className="list-disc ml-5 mt-1 text-sm">
                {svc.customMeasurements.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}


          {/* Standard Sizes */}
          {svc.types?.includes("standard") && svc.standardSizes && (
  <div className="mt-4 space-y-3">
    <strong className="block text-gray-700 mb-1">Standard Sizes:</strong>
    {Object.entries(svc.standardSizes).map(([garment, garmentData]) => (
  <div key={garment} className="mb-4">
    <p className="font-semibold text-gray-800 mb-2">{garment}</p>
    <div className="flex gap-4 flex-wrap">
      {garmentData.sizes
        .filter(size => garmentData.images?.[size]) // Only sizes with images
        .map((size) => (
          <div
            key={size}
            className="border rounded p-3 bg-white text-xs text-gray-600 flex flex-col items-center justify-center w-20 h-auto shadow-sm"
          >
            <span className="mb-2 font-semibold text-base">{size}</span>
            <img
              src={garmentData.images[size]}
              alt={`${garment} ${size}`}
              className="w-16 h-16 object-cover rounded mb-1"
            />
            {garmentData.measurements?.[size] && (
              <p className="text-gray-500 text-center text-xs whitespace-pre-line">
                {garmentData.measurements[size]}
              </p>
            )}
          </div>
        ))}
    </div>
  </div>
))}

  </div>
)}

        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-600 mb-6">No services added yet.</p>
  )}

      {/* Toggle button to show/hide new service form */}
      <button
        onClick={() => setShowAddServiceForm(!showAddServiceForm)}
        className="mb-6 bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 transition"
      >
        {showAddServiceForm ? 'Cancel Add Service' : '+ Add New Service'}
      </button>

      {/* New Service Form (conditionally rendered) */}
      {showAddServiceForm && (
        <div className="border-t pt-6 space-y-6 bg-indigo-50 rounded p-4 shadow-inner">
          <h3 className="text-xl font-semibold mb-4">Add New Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <input
              type="text"
              placeholder="Service Name"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              className="border border-gray-300 rounded p-3 w-full focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            />
            <input
              type="number"
              placeholder="Base Price"
              value={newBasePrice}
              onChange={(e) => setNewBasePrice(e.target.value)}
              className="border border-gray-300 rounded p-3 w-full focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              min="0"
              required
            />
            <input
              type="text"
              placeholder="Templates (comma separated, e.g. S, M, L, XL)"
              value={newTemplates.join(', ')}
              onChange={(e) => setNewTemplates(e.target.value.split(',').map(t => t.trim()))}
              className="border border-gray-300 rounded p-3 w-full focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          {/* Types checkboxes */}
          <div className="flex gap-6 mb-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newTypes.includes('standard')}
                onChange={() => toggleNewType('standard')}
                className="accent-indigo-600"
              />
              <span className="text-indigo-900 font-semibold">Standard</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newTypes.includes('custom')}
                onChange={() => toggleNewType('custom')}
                className="accent-indigo-600"
              />
              <span className="text-indigo-900 font-semibold">Custom</span>
            </label>
          </div>

          {/* Standard sizes images URL inputs */}
          {/* Standard sizes images and measurements input */}
{newTypes.includes('standard') && (
  <div className="mb-6 bg-indigo-100 rounded-lg p-4">
    <h4 className="font-semibold text-indigo-700 mb-3">Standard Sizes Per Garment</h4>
    {garmentTypes.map(garment => (
      <div key={garment} className="mb-4">
        <h5 className="font-semibold text-indigo-800 mb-2">{garment}</h5>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(newStandardSizes[garment]?.sizes || []).map(size => (
            <div
              key={size}
              className="bg-white border border-indigo-300 rounded p-3 flex flex-col shadow-sm"
            >
              <span className="font-semibold mb-2 text-indigo-800">{size}</span>
              <input
                type="text"
                placeholder="Image URL"
                value={newStandardSizes[garment].images[size] || ''}
                onChange={e => handleNewImageChange(garment, size, e.target.value)}
                className="w-full border border-indigo-300 rounded p-2 focus:ring-indigo-400 focus:ring-2 mb-2"
              />
              <input
                type="text"
                placeholder="Measurements (comma separated)"
                value={newStandardSizes[garment].measurements?.[size] || ''}
                onChange={e => {
                  setNewStandardSizes(prev => ({
                    ...prev,
                    [garment]: {
                      ...prev[garment],
                      measurements: {
                        ...prev[garment].measurements,
                        [size]: e.target.value
                      }
                    }
                  }));
                }}
                className="w-full border border-indigo-300 rounded p-2 focus:ring-indigo-400 focus:ring-2"
              />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
)}


          {/* Custom measurements input */}
          {newTypes.includes('custom') && (
            <div>
              <label className="block font-semibold mb-2 text-indigo-700">
                Custom Measurements (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g chest, waist, hips, length"
                value={newCustomMeasurements.join(', ')}
                onChange={e => handleCustomMeasurementsChange(e.target.value)}
                className="w-full border border-indigo-300 rounded p-3 focus:ring-indigo-400 focus:ring-2"
              />
            </div>
          )}

          {/* Add button */}
          <button
            onClick={handleAddNewService}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition focus:outline-none focus:ring-4 focus:ring-indigo-500 shadow-md"
          >
            Add Service
          </button>
        </div>
      )}
    </section>
  

      </div>
    </div>
  );
};

export default ViewShop;