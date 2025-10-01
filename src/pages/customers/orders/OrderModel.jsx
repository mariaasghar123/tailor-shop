import React, { useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../../../firebase";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';

const OrderModal = ({ shop, onClose }) => {
  const services = shop?.services || [];
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    if (services.length > 0 && !selectedService) {
      setSelectedService(services[0]);
    }
  }, [services]);

  const [type, setType] = useState("standard");
  const [templateSize, setTemplateSize] = useState("M");
  const [measurements, setMeasurements] = useState({
    neck: "", chest: "", waist: "", hips: "", length: "", sleeve: ""
  });
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [designFile, setDesignFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const currentUser = auth.currentUser;
  if (!currentUser) {
    return <div className="p-4 bg-red-100 text-red-700 rounded font-semibold">Please login to place an order.</div>;
  }

  const handleMeasurementChange = (e) => {
    setMeasurements(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address || !phone) {
      toast.error("Please enter address and phone.");
      return;
    }

    setSaving(true);
    try {
      let designImageUrl = null;
      if (designFile) {
        const fileRef = ref(storage, `orders/${shop.id}_${currentUser.uid}/${Date.now()}_${designFile.name}`);
        const uploadTask = uploadBytesResumable(fileRef, designFile);
        await new Promise((resolve, reject) => {
          uploadTask.on("state_changed",
            (snapshot) => {
              const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setUploadProgress(percent);
            },
            (err) => reject(err),
            async () => {
              designImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      const orderData = {
        customerId: currentUser.uid,
        shopId: shop.id,
        shopName: shop.name || shop.shopName,
        service: selectedService,
        serviceName: selectedService?.name,
        basePrice: selectedService?.basePrice,
        type: type,
        measurements: type === "custom" ? measurements : null,
        template: type === "standard" ? templateSize : null,
        designImageUrl: designImageUrl || null,
        notes,
        address,
        phone,
        status: "pending",
        assignedTailorId: null,
        createdAt: serverTimestamp()
      };
      const ordersRef = collection(db, "orders");
      const docRef = await addDoc(ordersRef, orderData);

      toast.success("Order placed successfully!");
      onClose?.(docRef.id);
      navigate('/my-orders');
    } catch (err) {
      console.error("Order create error:", err);
      toast.error("Failed to place order: " + (err.message || err));
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black bg-opacity-60 backdrop-blur-sm">
      <div 
        className="absolute inset-0" 
        onClick={() => onClose?.()} 
        aria-hidden="true"
      />
      <div className="relative z-10 bg-gradient-to-br from-white/80 to-blue-100/90 rounded-3xl shadow-2xl max-w-3xl w-full p-8 overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-transparent">
        <h3 className="text-3xl font-extrabold text-indigo-700 mb-6 select-none">{`Place Order — ${shop.shopName}`}</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Service Selection */}
<div>
  <label htmlFor="service-select" className="block mb-2 text-indigo-600 font-semibold">Select Service</label>
  <select
    id="service-select"
    className="w-full p-3 border-2 border-indigo-300 rounded-xl focus:ring-4 focus:ring-indigo-400 transition duration-300 text-indigo-900 font-semibold bg-white"
    value={selectedService?.name || ""}
    onChange={(e) => {
      const service = services.find(s => s.name === e.target.value);
      setSelectedService(service);
    }}
    required
  >
    {services.map((service) => (
      <option key={service.name} value={service.name}>
        {service.name} — ${service.basePrice !== undefined ? service.basePrice.toFixed(2) : "0.00"}
      </option>
    ))}
  </select>
</div>
{/* Insert here the image + measurements display for selected service */}
  {selectedService?.types?.includes('standard') && selectedService.standardSizes && (
    <div className="mb-6 bg-indigo-50 rounded-lg p-4 max-h-56 overflow-y-auto shadow-inner">
      <h4 className="text-indigo-700 font-semibold mb-3">Standard Sizes Details</h4>
      {Object.entries(selectedService.standardSizes).map(([garment, garmentData]) => (
        <div key={garment} className="mb-4">
          <p className="font-semibold text-indigo-900 mb-1">{garment}</p>
          <div className="flex gap-3 flex-wrap">
            {garmentData.sizes.filter(size => garmentData.images?.[size]).map(size => (
              <div key={size} className="border rounded p-2 flex flex-col items-center w-20">
                <span className="font-semibold mb-1">{size}</span>
                <img
                  src={garmentData.images[size]}
                  alt={`${garment} ${size}`}
                  className="w-16 h-16 object-cover rounded"
                />
                {garmentData.measurements?.[size] && (
                  <p className="text-xs mt-1 text-center text-indigo-700 whitespace-pre-line">
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


          {/* Template or Custom Toggle */}
          <div className="flex gap-8 text-indigo-700 font-semibold select-none">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                checked={type === "standard"} 
                onChange={() => setType('standard')}
                className="accent-indigo-600 w-5 h-5"
              />
              Template
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                checked={type === "custom"} 
                onChange={() => setType('custom')}
                className="accent-indigo-600 w-5 h-5"
              />
              Custom
            </label>
          </div>

          {/* Template Size or Measurements */}
          {type === "standard" ? (
            <div className="flex items-center gap-4">
              <label className="text-indigo-600 font-semibold" htmlFor="templateSize">Template Size</label>
              <select
                id="templateSize"
                value={templateSize}
                onChange={(e) => setTemplateSize(e.target.value)}
                className="p-3 border-2 border-indigo-300 rounded-xl focus:ring-4 focus:ring-indigo-400 transition duration-300 text-indigo-900 bg-white font-semibold"
                required
              >
                <option>S</option><option>M</option><option>L</option><option>XL</option>
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["neck", "chest", "waist", "hips", "length", "sleeve"].map(field => (
                <input
                  key={field}
                  name={field}
                  value={measurements[field]}
                  onChange={handleMeasurementChange}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  className="p-3 border-2 border-indigo-300 rounded-xl focus:ring-4 focus:ring-indigo-400 transition duration-300 text-indigo-900 bg-white font-semibold"
                  required
                  type="text"
                  inputMode="decimal"
                  pattern="^[0-9,.]*$"
                  title="Please enter a valid number"
                />
              ))}
              <div className="col-span-1 sm:col-span-2">
                <label htmlFor="designFile" className="block mb-2 text-indigo-600 font-semibold">Upload Design (optional)</label>
                <input
                  id="designFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDesignFile(e.target.files[0])}
                  className="block w-full text-indigo-700 file:bg-indigo-100 file:text-indigo-700 file:border-0 file:rounded-lg file:px-4 file:py-2 cursor-pointer font-semibold"
                />
                {uploadProgress > 0 && (
                  <div className="mt-2 text-indigo-700 font-medium">
                    Uploading: {uploadProgress}%
                  </div>
                )}
              </div>
              <textarea
                placeholder="Any notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-1 sm:col-span-2 p-3 border-2 border-indigo-300 rounded-xl focus:ring-4 focus:ring-indigo-400 transition duration-300 text-indigo-900 bg-white font-semibold resize-none h-24"
              />
            </div>
          )}

          {/* Address and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Delivery Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="p-3 border-2 border-indigo-300 rounded-xl focus:ring-4 focus:ring-indigo-400 transition duration-300 text-indigo-900 bg-white font-semibold"
              required
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="p-3 border-2 border-indigo-300 rounded-xl focus:ring-4 focus:ring-indigo-400 transition duration-300 text-indigo-900 bg-white font-semibold"
              required
              pattern="^[0-9+\-().\s]*$"
              title="Enter a valid phone number"
            />
          </div>

          {/* Price and Action Buttons */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-indigo-700 text-lg font-extrabold tracking-wide select-none">
  Price: ${(selectedService?.basePrice ?? 0).toFixed(2)}
</div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => onClose?.()}
                disabled={saving}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Placing...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
