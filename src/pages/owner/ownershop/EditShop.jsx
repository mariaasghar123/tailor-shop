import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const EditShop = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // same fields as CreateShop
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState(0);
  const [services, setServices] = useState([]);
  const [templates, setTemplates] = useState([]);

  // new states for adding service/template
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newTemplate, setNewTemplate] = useState('');

  // fetch shop data
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const docRef = doc(db, 'shops', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || '');
          setDescription(data.description || '');
          setImage(data.image || '');
          setLocation(data.location || '');
          setPhone(data.phone || '');
          setRating(data.rating || 0);
          setServices(data.services || []);
          setTemplates(data.templates || []);
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching shop details');
      }
    };
    fetchShop();
  }, [id]);

  // add a new service
  const handleAddService = () => {
    if (!newServiceName || !newServicePrice) {
      toast.error('Enter service name and price');
      return;
    }
    setServices([
      ...services,
      {
        serviceID: `svc${Date.now()}`,
        name: newServiceName,
        basePrice: Number(newServicePrice),
      },
    ]);
    setNewServiceName('');
    setNewServicePrice('');
  };

  // remove a service
  const handleRemoveService = (index) => {
    const updated = [...services];
    updated.splice(index, 1);
    setServices(updated);
  };

  // add a new template
  const handleAddTemplate = () => {
    if (!newTemplate) {
      toast.error('Enter template name/size');
      return;
    }
    setTemplates([...templates, newTemplate]);
    setNewTemplate('');
  };

  // remove template
  const handleRemoveTemplate = (index) => {
    const updated = [...templates];
    updated.splice(index, 1);
    setTemplates(updated);
  };

  // update shop
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'shops', id), {
        name,
        description,
        image,
        location,
        phone,
        rating: Number(rating),
        services,
        templates,
      });
      toast.success('Shop Updated Successfully!');
      navigate('/owner/shops'); // adjust your route
    } catch (err) {
      console.error(err);
      toast.error('Error updating shop');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Edit Shop</h2>

      <form
        onSubmit={handleUpdate}
        className="bg-white shadow-md rounded-lg p-6 space-y-6"
      >
        {/* --- Basic Info Section --- */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Basic Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Shop Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <input
              type="number"
              placeholder="Rating (0-5)"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded w-full mt-4"
          />

          <input
            type="text"
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="border p-2 rounded w-full mt-4"
          />
        </div>

        {/* --- Services Section --- */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-xl font-semibold mb-3">Services</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Service Name"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              className="border p-2 rounded flex-1"
            />
            <input
              type="number"
              placeholder="Base Price"
              value={newServicePrice}
              onChange={(e) => setNewServicePrice(e.target.value)}
              className="border p-2 rounded w-32"
            />
            <button
              type="button"
              onClick={handleAddService}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              + Add
            </button>
          </div>

          <ul className="space-y-2">
            {services.map((service, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center bg-white border rounded p-2"
              >
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-gray-500">
                    Price: ${service.basePrice}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveService(idx)}
                  className="text-red-500"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* --- Templates Section --- */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-xl font-semibold mb-3">Templates</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Template (e.g. S, M, L)"
              value={newTemplate}
              onChange={(e) => setNewTemplate(e.target.value)}
              className="border p-2 rounded flex-1"
            />
            <button
              type="button"
              onClick={handleAddTemplate}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              + Add
            </button>
          </div>

          <ul className="flex flex-wrap gap-2">
            {templates.map((template, idx) => (
              <li
                key={idx}
                className="bg-white border rounded px-3 py-1 flex items-center gap-2"
              >
                {template}
                <button
                  type="button"
                  onClick={() => handleRemoveTemplate(idx)}
                  className="text-red-500 text-sm"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded w-full">
          Update Shop
        </button>
      </form>
    </div>
  );
};

export default EditShop;
