import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const garmentTypes = ["Shirt", "Pants", "Coat"];

const EditShop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  // Basic shop fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState(0);
  const [image, setImage] = useState('');

  // Services
  const [services, setServices] = useState([]);
  const [editServiceIndex, setEditServiceIndex] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    basePrice: 0,
    templates: [],
    types: [],
    standardSizes: garmentTypes.reduce((acc, g) => {
      acc[g] = { sizes: ['S', 'M', 'L', 'XL'], images: {}, measurements: {} };
      return acc;
    }, {}),
    customMeasurements: []
  });

  // New service form
  const [showNewServiceForm, setShowNewServiceForm] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newBasePrice, setNewBasePrice] = useState('');
  const [newTypes, setNewTypes] = useState(['standard']);
  const [newStandardSizes, setNewStandardSizes] = useState(
    garmentTypes.reduce((acc, g) => {
      acc[g] = { sizes: ['S', 'M', 'L', 'XL'], images: {}, measurements: {} };
      return acc;
    }, {})
  );
  const [newCustomMeasurements, setNewCustomMeasurements] = useState([]);
  const [newTemplates, setNewTemplates] = useState(['S', 'M', 'L', 'XL']);

  // Fetch shop data
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const docRef = doc(db, 'shops', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setShop(data);
          setName(data.name || '');
          setDescription(data.description || '');
          setLocation(data.location || '');
          setPhone(data.phone || '');
          setRating(data.rating || 0);
          setImage(data.image || '');
          setServices(data.services || []);
        } else {
          toast.error('Shop not found');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching shop');
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [id]);

  const toggleType = (typesArray, type, setFn) => {
    if (typesArray.includes(type)) setFn(typesArray.filter(t => t !== type));
    else setFn([...typesArray, type]);
  };

  const handleStandardImageChange = (sizesObj, setFn, garment, size, value) => {
    setFn(prev => ({
      ...prev,
      [garment]: {
        ...prev[garment],
        images: { ...prev[garment].images, [size]: value },
      }
    }));
  };

  const handleStandardMeasurementChange = (sizesObj, setFn, garment, size, value) => {
    setFn(prev => ({
      ...prev,
      [garment]: {
        ...prev[garment],
        measurements: { ...prev[garment].measurements, [size]: value },
      }
    }));
  };

  const handleUpdateService = async (index) => {
    const updatedServices = [...services];
    updatedServices[index] = serviceFormData;

    try {
      await updateDoc(doc(db, 'shops', id), { services: updatedServices });
      setServices(updatedServices);
      setEditServiceIndex(null);
      toast.success('Service updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update service');
    }
  };

  const handleDeleteService = async (index) => {
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    try {
      await updateDoc(doc(db, 'shops', id), { services: updatedServices });
      setServices(updatedServices);
      toast.success('Service deleted!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete service');
    }
  };

  const handleAddService = async () => {
    if (!newServiceName || !newBasePrice) {
      toast.error('Service name and base price required');
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
      await updateDoc(doc(db, 'shops', id), {
        services: [...services, newService]
      });
      setServices([...services, newService]);
      toast.success('Service added!');
      // reset form
      setNewServiceName('');
      setNewBasePrice('');
      setNewTypes(['standard']);
      setNewStandardSizes(
        garmentTypes.reduce((acc, g) => {
          acc[g] = { sizes: ['S', 'M', 'L', 'XL'], images: {}, measurements: {} };
          return acc;
        }, {})
      );
      setNewCustomMeasurements([]);
      setNewTemplates(['S', 'M', 'L', 'XL']);
      setShowNewServiceForm(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to add service');
    }
  };

  const handleUpdateShop = async () => {
    try {
      await updateDoc(doc(db, 'shops', id), {
        name, description, location, phone, rating: Number(rating), image, services
      });
      toast.success('Shop updated successfully!');
      navigate('/owner/shops');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update shop');
    }
  };

  if (loading) return <div className="p-6 text-center text-indigo-700 font-semibold">Loading...</div>;
  if (!shop) return <div className="p-6 text-center text-red-600 font-semibold">Shop not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Basic Info */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Edit Shop</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Shop Name" className="border p-2 rounded w-full" />
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="border p-2 rounded w-full" />
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="border p-2 rounded w-full" />
            <input type="number" value={rating} onChange={e => setRating(e.target.value)} placeholder="Rating" className="border p-2 rounded w-full" />
            <input type="text" value={image} onChange={e => setImage(e.target.value)} placeholder="Image URL" className="border p-2 rounded w-full md:col-span-2" />
          </div>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="border p-2 rounded w-full" />
        </div>

        {/* Services */}
        <section className="bg-white p-6 rounded-xl shadow-md space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800">Services</h3>

          {services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc, idx) => (
                <div key={idx} className="border p-4 rounded-lg bg-gray-50">
                  {editServiceIndex === idx ? (
                    <>
                      <input type="text" value={serviceFormData.name} onChange={e => setServiceFormData({...serviceFormData, name: e.target.value})} className="border p-1 rounded w-full mb-1" />
                      <input type="number" value={serviceFormData.basePrice} onChange={e => setServiceFormData({...serviceFormData, basePrice: Number(e.target.value)})} className="border p-1 rounded w-full mb-1" />

                      <input
                        type="text"
                        value={(serviceFormData.templates || []).join(', ')}
                        onChange={e => setServiceFormData({
                          ...serviceFormData,
                          templates: e.target.value.split(',').map(t => t.trim())
                        })}
                        className="border p-1 rounded w-full mb-1"
                        placeholder="Templates (comma separated)"
                      />

                      <div className="flex gap-2 mb-2">
                        <label><input type="checkbox" checked={serviceFormData.types.includes('standard')} onChange={() => toggleType(serviceFormData.types, 'standard', val => setServiceFormData({...serviceFormData, types: val}))} /> Standard</label>
                        <label><input type="checkbox" checked={serviceFormData.types.includes('custom')} onChange={() => toggleType(serviceFormData.types, 'custom', val => setServiceFormData({...serviceFormData, types: val}))} /> Custom</label>
                      </div>

                      {/* Standard sizes */}
                      {serviceFormData.types.includes('standard') && garmentTypes.map(garment => (
                        <div key={garment} className="mb-2">
                          <p className="font-semibold">{garment}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {(serviceFormData.standardSizes?.[garment]?.sizes || []).map(size => (
                              <div key={size} className="flex flex-col border p-1 rounded bg-white">
                                <span className="font-medium text-xs">{size}</span>
                                <input type="text" placeholder="Image URL" value={serviceFormData.standardSizes?.[garment]?.images?.[size] || ''} onChange={e => handleStandardImageChange(serviceFormData.standardSizes, val => setServiceFormData({...serviceFormData, standardSizes: val}), garment, size, e.target.value)} className="border p-1 rounded mb-1" />
                                <input type="text" placeholder="Measurement" value={serviceFormData.standardSizes?.[garment]?.measurements?.[size] || ''} onChange={e => handleStandardMeasurementChange(serviceFormData.standardSizes, val => setServiceFormData({...serviceFormData, standardSizes: val}), garment, size, e.target.value)} className="border p-1 rounded" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Custom measurements */}
                      {serviceFormData.types.includes('custom') && (
                        <input type="text" placeholder="Custom measurements (comma separated)" value={(serviceFormData.customMeasurements || []).join(', ')} onChange={e => setServiceFormData({...serviceFormData, customMeasurements: e.target.value.split(',').map(v=>v.trim())})} className="border p-1 rounded w-full mb-2" />
                      )}

                      <button onClick={() => handleUpdateService(idx)} className="bg-green-600 text-white px-2 py-1 rounded mr-2">Save</button>
                      <button onClick={() => {setEditServiceIndex(null);}} className="bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
                    </>
                  ) : (
                    <>
                      <h4 className="font-bold text-lg">{svc.name}</h4>
                      <p className="text-gray-700 mb-1">Price: ${svc.basePrice}</p>
                      {svc.types && <p className="text-gray-600 mb-1">Types: {svc.types.join(', ')}</p>}
                      {svc.templates?.length > 0 && <p className="text-gray-600 mb-1">Templates: {svc.templates.join(', ')}</p>}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            setEditServiceIndex(idx);
                            setServiceFormData({
                              name: svc.name || '',
                              basePrice: svc.basePrice || 0,
                              templates: svc.templates || [],
                              types: svc.types || [],
                              standardSizes: svc.standardSizes || {},
                              customMeasurements: svc.customMeasurements || []
                            });
                          }}
                          className="bg-indigo-600 text-white px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteService(idx)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : <p>No services added yet.</p>}

          {/* New Service Form Toggle */}
          <button onClick={() => setShowNewServiceForm(!showNewServiceForm)} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            {showNewServiceForm ? 'Cancel' : '+ Add New Service'}
          </button>

          {/* New Service Form */}
          {showNewServiceForm && (
            <div className="mt-4 space-y-4 bg-indigo-50 p-4 rounded-lg">
              <input type="text" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} placeholder="Service Name" className="border p-2 rounded w-full" />
              <input type="number" value={newBasePrice} onChange={e => setNewBasePrice(e.target.value)} placeholder="Base Price" className="border p-2 rounded w-full" />
              <input type="text" value={newTemplates.join(', ')} onChange={e => setNewTemplates(e.target.value.split(',').map(t => t.trim()))} placeholder="Templates (comma separated)" className="border p-2 rounded w-full" />
              <div className="flex gap-4">
                <label><input type="checkbox" checked={newTypes.includes('standard')} onChange={() => toggleType(newTypes, 'standard', setNewTypes)} /> Standard</label>
                <label><input type="checkbox" checked={newTypes.includes('custom')} onChange={() => toggleType(newTypes, 'custom', setNewTypes)} /> Custom</label>
              </div>
              {newTypes.includes('standard') && garmentTypes.map(garment => (
                <div key={garment}>
                  <p className="font-semibold">{garment}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {newStandardSizes[garment].sizes.map(size => (
                      <div key={size} className="flex flex-col border p-2 rounded bg-white">
                        <span className="font-medium">{size}</span>
                        <input type="text" placeholder="Image URL" value={newStandardSizes[garment].images[size] || ''} onChange={e => handleStandardImageChange(newStandardSizes, setNewStandardSizes, garment, size, e.target.value)} className="border p-1 rounded mb-1" />
                        <input type="text" placeholder="Measurements" value={newStandardSizes[garment].measurements[size] || ''} onChange={e => handleStandardMeasurementChange(newStandardSizes, setNewStandardSizes, garment, size, e.target.value)} className="border p-1 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {newTypes.includes('custom') && (
                <input type="text" placeholder="Custom measurements (comma separated)" value={newCustomMeasurements.join(', ')} onChange={e => setNewCustomMeasurements(e.target.value.split(',').map(v => v.trim()))} className="border p-2 rounded w-full" />
              )}
              <button onClick={handleAddService} className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Add Service</button>
            </div>
          )}
        </section>

        {/* Update Shop Button */}
        <button onClick={handleUpdateShop} className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">Update Shop</button>
      </div>
    </div>
  );
};

export default EditShop;
