import React, { useState } from "react";
import { db, auth } from "../../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
const storage = getStorage();

const garmentTypes = ["Shirt", "Pants", "Coat"];

const CreateShop = () => {
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [rating, setRating] = useState("");
  const [services, setServices] = useState([
    {
      serviceID: "svc1",
      name: "Shirt Stitching",
      basePrice: 20,
      types: ["standard", "custom"],
      standardSizes: {
        Shirt: { sizes: ["S", "M", "L", "XL"], images: {} }, // images keyed by size
        Pants: { sizes: ["S", "M", "L", "XL"], images: {} },
        Coat: { sizes: ["S", "M", "L", "XL"], images: {} },
      },
      customMeasurements: ["chest", "waist", "hips", "length", "sleeve"],
    },
  ]);
  const [templates, setTemplates] = useState(["S", "M", "L", "XL"]);

  // Handle adding a new service
  const addService = () => {
    setServices([
      ...services,
      {
        serviceID: "svc" + Date.now(),
        name: "",
        basePrice: 0,
        types: ["standard"],
        standardSizes: garmentTypes.reduce((acc, g) => {
          acc[g] = { sizes: ["S", "M", "L", "XL"], images: {} };
          return acc;
        }, {}),
        customMeasurements: [],
      },
    ]);
  };

  const updateServiceField = (index, field, value) => {
    const updated = [...services];
    if (field === "basePrice") {
      updated[index][field] = Number(value);
    } else {
      updated[index][field] = value;
    }
    setServices(updated);
  };

  const toggleServiceType = (index, type) => {
    const updated = [...services];
    if (updated[index].types.includes(type)) {
      updated[index].types = updated[index].types.filter((t) => t !== type);
    } else {
      updated[index].types.push(type);
    }
    setServices(updated);
  };

  // Upload image for a standard type size
  const updateStandardImage = async (svcIndex, garment, size, file) => {
    const updated = [...services];
    if (!updated[svcIndex].standardSizes[garment].images) {
      updated[svcIndex].standardSizes[garment].images = {};
    }

    try {
      // 1. Storage path define karo
      const storageRef = ref(
        storage,
        `shops/${auth.currentUser.uid}/${file.name}`
      );

      // 2. File ko upload karo
      await uploadBytes(storageRef, file);

      // 3. Download URL lo
      const downloadURL = await getDownloadURL(storageRef);

      // 4. URL ko save karo service object me
      updated[svcIndex].standardSizes[garment].images[size] = downloadURL;
      setServices(updated);
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  const updateCustomMeasurements = (index, measurementsString) => {
    const arr = measurementsString
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    const updated = [...services];
    updated[index].customMeasurements = arr;
    setServices(updated);
  };

  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const addTemplate = () => setTemplates([...templates, ""]);
  const updateTemplate = (index, value) => {
    const updated = [...templates];
    updated[index] = value;
    setTemplates(updated);
  };
  const removeTemplate = (index) =>
    setTemplates(templates.filter((_, i) => i !== index));

  // Submit handler - same as before, validation etc.
  const handleCreateShop = async (e) => {
    e.preventDefault();
    if (!shopName || !description || !location) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      await addDoc(collection(db, "shops"), {
        ownerId: auth.currentUser.uid,
        name: shopName,
        description,
        image,
        location,
        phone,
        rating: Number(rating) || 0,
        services,
        templates,
        createdAt: serverTimestamp(),
      });
      toast.success("Shop Created Successfully!");
      // Reset form
      setShopName("");
      setDescription("");
      setImage("");
      setLocation("");
      setPhone("");
      setRating("");
      setServices([
        {
          serviceID: "svc1",
          name: "Shirt Stitching",
          basePrice: 20,
          types: ["standard", "custom"],
          standardSizes: garmentTypes.reduce((acc, g) => {
            acc[g] = { sizes: ["S", "M", "L", "XL"], images: {} };
            return acc;
          }, {}),
          customMeasurements: ["chest", "waist", "hips", "length", "sleeve"],
        },
      ]);
      setTemplates(["S", "M", "L", "XL"]);
    } catch (err) {
      console.error(err);
      toast.error("Error creating shop");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-100 via-indigo-100 to-pink-100 py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-10 border border-indigo-200">
        <h1 className="text-4xl font-extrabold mb-8 text-indigo-900">
          Create New Shop
        </h1>
        <form onSubmit={handleCreateShop} className="space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              className="border border-indigo-300 focus:ring-indigo-400 focus:ring-2 rounded-lg p-3 text-indigo-900 font-semibold"
              placeholder="Shop Name*"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />
            <input
              className="border border-indigo-300 focus:ring-indigo-400 focus:ring-2 rounded-lg p-3 text-indigo-900 font-semibold"
              placeholder="Image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            <input
              className="border border-indigo-300 focus:ring-indigo-400 focus:ring-2 rounded-lg p-3 text-indigo-900 font-semibold"
              placeholder="Location*"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <input
              className="border border-indigo-300 focus:ring-indigo-400 focus:ring-2 rounded-lg p-3 text-indigo-900 font-semibold"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              className="border border-indigo-300 focus:ring-indigo-400 focus:ring-2 rounded-lg p-3 text-indigo-900 font-semibold"
              placeholder="Rating (0-5)"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </div>
          <textarea
            rows={4}
            className="w-full border border-indigo-300 focus:ring-indigo-400 focus:ring-2 rounded-lg p-3 text-indigo-900 font-semibold"
            placeholder="Description*"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Services */}
          <section className="border border-indigo-300 rounded-2xl p-6 bg-indigo-50 shadow-inner">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-indigo-900">Services</h2>
              <button
                type="button"
                onClick={addService}
                className="bg-indigo-700 hover:bg-indigo-900 transition text-white px-4 py-2 rounded-xl shadow-md"
              >
                + Add Service
              </button>
            </div>

            {services.map((service, index) => (
              <div
                key={service.serviceID}
                className="bg-white rounded-xl p-5 mb-8 shadow-md border border-indigo-300"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-4">
                  <input
                    type="text"
                    placeholder="Service Name"
                    className="border border-indigo-300 rounded px-4 py-2 w-full md:w-1/3 focus:ring-indigo-400 focus:ring-2"
                    value={service.name}
                    onChange={(e) =>
                      updateServiceField(index, "name", e.target.value)
                    }
                    required
                  />
                  <input
                    type="number"
                    placeholder="Base Price"
                    className="border border-indigo-300 rounded px-4 py-2 w-full md:w-1/4 focus:ring-indigo-400 focus:ring-2"
                    value={service.basePrice}
                    onChange={(e) =>
                      updateServiceField(index, "basePrice", e.target.value)
                    }
                    min={0}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="bg-red-600 hover:bg-red-800 transition text-white px-4 py-2 rounded"
                  >
                    Remove
                  </button>
                </div>

                {/* Type Selector */}
                <div className="flex gap-6 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={service.types.includes("standard")}
                      onChange={() => toggleServiceType(index, "standard")}
                      className="accent-indigo-600"
                    />
                    <span className="text-indigo-900 font-semibold">
                      Standard
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={service.types.includes("custom")}
                      onChange={() => toggleServiceType(index, "custom")}
                      className="accent-indigo-600"
                    />
                    <span className="text-indigo-900 font-semibold">
                      Custom
                    </span>
                  </label>
                </div>

                {/* Standard sizes with image upload */}
                {/* Standard sizes with image URL input */}
{service.types.includes('standard') && (
  <div className="mb-4 bg-indigo-100 rounded-lg p-4">
    <h3 className="font-semibold text-indigo-700 mb-3">Standard Sizes Per Garment</h3>
    {garmentTypes.map(garment => (
      <div key={garment} className="mb-6">
        <h4 className="font-semibold text-indigo-800 mb-2">{garment}</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(service.standardSizes[garment]?.sizes || []).map(size => (
  <div
    key={size} className="bg-white border border-indigo-300 rounded p-3 flex flex-col shadow-sm mb-4"
  >
    <span className="font-semibold mb-2">{size}</span>
    {/* Image URL input */}
    <input
      type="text"
      placeholder="Enter Image URL"
      className="mb-2 w-full border border-indigo-300 rounded p-2 focus:ring-indigo-400 focus:ring-2"
      value={service.standardSizes[garment].images?.[size] || ''}
      onChange={e => {
        const updated = [...services];
        updated[index].standardSizes[garment].images[size] = e.target.value;
        setServices(updated);
      }}
    />
    {/* Measurements input */}
    <input
      type="text"
      placeholder="Enter Measurements (comma separated)"
      className="w-full border border-indigo-300 rounded p-2 focus:ring-indigo-400 focus:ring-2"
      value={service.standardSizes[garment].measurements?.[size] || ''}
      onChange={e => {
        const updated = [...services];
        if(!updated[index].standardSizes[garment].measurements) {
          updated[index].standardSizes[garment].measurements = {};
        }
        updated[index].standardSizes[garment].measurements[size] = e.target.value;
        setServices(updated);
      }}
    />
  </div>
))}

        </div>
      </div>
    ))}
  </div>
)}


                {/* Custom measurements input */}
                {service.types.includes("custom") && (
                  <div>
                    <label className="block font-semibold mb-2 text-indigo-700">
                      Custom Measurements (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g chest, waist, hips, length"
                      className="w-full border border-indigo-300 rounded p-3 focus:ring-indigo-400 focus:ring-2"
                      value={service.customMeasurements.join(", ")}
                      onChange={(e) =>
                        updateCustomMeasurements(index, e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* Templates Section */}
          <section className="border border-indigo-300 rounded-2xl p-6 bg-indigo-50 shadow-inner">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-indigo-900">Templates</h2>
              <button
                type="button"
                onClick={addTemplate}
                className="bg-indigo-700 hover:bg-indigo-900 transition text-white px-4 py-2 rounded-xl shadow-md"
              >
                + Add Template
              </button>
            </div>
            {templates.map((tmp, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-4 mb-3 bg-white rounded-lg p-3 border border-indigo-300"
              >
                <input
                  className="border border-indigo-300 rounded px-4 py-2 w-full focus:ring-indigo-400 focus:ring-2"
                  placeholder="Template (e.g. S)"
                  value={tmp}
                  onChange={(e) => updateTemplate(idx, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeTemplate(idx)}
                  className="bg-red-600 hover:bg-red-800 text-white px-4 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </section>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-600 py-3 text-white text-xl font-bold rounded-xl hover:scale-105 transition-transform shadow-lg"
          >
            Create Shop
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateShop;
