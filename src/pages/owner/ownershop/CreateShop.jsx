import React, { useState } from 'react';
import { db, auth } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';

const CreateShop = () => {
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState('');

  // Services array (with types + measurements)
  const [services, setServices] = useState([
    {
      serviceID: 'svc1',
      name: 'Shirt Stitching',
      basePrice: 20,
      types: ['standard', 'custom'],
      measurements: ['chest', 'waist', 'hips', 'length', 'sleeve']
    }
  ]);

  const [templates, setTemplates] = useState(['S', 'M', 'L', 'XL']);

  // Add / update / remove service
  const addService = () => {
    setServices([
      ...services,
      {
        serviceID: 'svc' + Date.now(),
        name: '',
        basePrice: 0,
        types: ['standard'],
        measurements: []
      }
    ]);
  };

  const updateServiceField = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = field === 'basePrice' ? Number(value) : value;
    setServices(updated);
  };

  const updateServiceTypes = (index, type) => {
    const updated = [...services];
    if (updated[index].types.includes(type)) {
      updated[index].types = updated[index].types.filter((t) => t !== type);
    } else {
      updated[index].types.push(type);
    }
    setServices(updated);
  };

  const updateMeasurements = (index, measurementsString) => {
    // comma separated → array
    const arr = measurementsString.split(',').map((m) => m.trim()).filter(Boolean);
    const updated = [...services];
    updated[index].measurements = arr;
    setServices(updated);
  };

  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  // Templates add/update/remove
  const addTemplate = () => setTemplates([...templates, '']);
  const updateTemplate = (index, value) => {
    const updated = [...templates];
    updated[index] = value;
    setTemplates(updated);
  };
  const removeTemplate = (index) => setTemplates(templates.filter((_, i) => i !== index));

  // Submit
  const handleCreateShop = async (e) => {
    e.preventDefault();
    if (!shopName || !description || !location) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await addDoc(collection(db, 'shops'), {
        ownerId: auth.currentUser.uid,
        name: shopName,
        description,
        image,
        location,
        phone,
        rating: Number(rating) || 0,
        services,
        templates,
        createdAt: serverTimestamp()
      });
      toast.success('Shop Created Successfully!');
      setShopName('');
      setDescription('');
      setImage('');
      setLocation('');
      setPhone('');
      setRating('');
      setServices([
        {
          serviceID: 'svc1',
          name: 'Shirt Stitching',
          basePrice: 20,
          types: ['standard', 'custom'],
          measurements: ['chest', 'waist', 'hips', 'length', 'sleeve']
        }
      ]);
      setTemplates(['S', 'M', 'L', 'XL']);
    } catch (err) {
      console.error(err);
      toast.error('Error creating shop');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Shop</h1>
        <form onSubmit={handleCreateShop} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input className="border p-2 rounded" placeholder="Shop Name*" value={shopName} onChange={(e)=>setShopName(e.target.value)} />
            <input className="border p-2 rounded" placeholder="Image URL" value={image} onChange={(e)=>setImage(e.target.value)} />
            <input className="border p-2 rounded" placeholder="Location*" value={location} onChange={(e)=>setLocation(e.target.value)} />
            <input className="border p-2 rounded" placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
            <input className="border p-2 rounded" placeholder="Rating (0–5)" type="number" value={rating} onChange={(e)=>setRating(e.target.value)} />
          </div>

          <textarea className="w-full border p-2 rounded" rows={3} placeholder="Description*" value={description} onChange={(e)=>setDescription(e.target.value)} />

          {/* Services Section */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-gray-800">Services</h3>
              <button type="button" onClick={addService} className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">
                + Add Service
              </button>
            </div>

            {services.map((svc, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded mb-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                  <input className="border p-2 rounded" placeholder="Service Name" value={svc.name} onChange={(e)=>updateServiceField(idx,'name',e.target.value)} />
                  <input className="border p-2 rounded" placeholder="Base Price" type="number" value={svc.basePrice} onChange={(e)=>updateServiceField(idx,'basePrice',e.target.value)} />
                  <button type="button" onClick={()=>removeService(idx)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    Remove
                  </button>
                </div>

                {/* Types */}
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={svc.types.includes('standard')} onChange={()=>updateServiceTypes(idx,'standard')} /> Standard
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={svc.types.includes('custom')} onChange={()=>updateServiceTypes(idx,'custom')} /> Custom
                  </label>
                </div>

                {/* Measurements (only if custom selected) */}
                {svc.types.includes('custom') && (
                  <input
                    className="border p-2 rounded w-full"
                    placeholder="Measurements (comma separated e.g. chest,waist,length)"
                    value={svc.measurements.join(', ')}
                    onChange={(e)=>updateMeasurements(idx,e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Templates Section */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-gray-800">Templates</h3>
              <button type="button" onClick={addTemplate} className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">
                + Add Template
              </button>
            </div>

            {templates.map((tmp, idx) => (
              <div key={idx} className="flex items-center gap-4 mb-2 bg-gray-50 p-3 rounded">
                <input className="border p-2 rounded flex-1" placeholder="Template (e.g. S)" value={tmp} onChange={(e)=>updateTemplate(idx,e.target.value)} />
                <button type="button" onClick={()=>removeTemplate(idx)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">Create Shop</button>
        </form>
      </div>
    </div>
  );
};

export default CreateShop;
