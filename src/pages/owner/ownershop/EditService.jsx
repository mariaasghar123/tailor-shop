import React, { useState, useEffect } from "react";

const garmentTypes = ["Shirt", "Pants", "Coat"];

// Helper to merge defaults with existing Firestore service data safely
const ensureStandardSizes = (svc) => {
  return {
    ...svc,
    standardSizes: garmentTypes.reduce((acc, g) => {
      const existing = svc.standardSizes?.[g] || {};
      acc[g] = {
        sizes: existing.sizes || ["S", "M", "L", "XL"],
        images: existing.images || {},
        measurements: existing.measurements || {},
      };
      return acc;
    }, {}),
  };
};

const EditService = ({ service, onSave }) => {
  // Initialize form data ensuring existence of standardSizes structure
  const [formData, setFormData] = useState(() => ensureStandardSizes(service || {}));

  // On service prop change, update formData state merged with defaults
  useEffect(() => {
    if (service) {
      setFormData(ensureStandardSizes(service));
    }
  }, [service]);

  // Simple text and number inputs generic handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle checkbox for service types (standard/custom)
  const handleTypeChange = (type) => {
    setFormData((prev) => {
      const types = prev.types || [];
      const exists = types.includes(type);
      return {
        ...prev,
        types: exists ? types.filter((t) => t !== type) : [...types, type],
      };
    });
  };

  // Update images URL for particular garment and size
  const handleImageChange = (garment, size, value) => {
    setFormData((prev) => ({
      ...prev,
      standardSizes: {
        ...prev.standardSizes,
        [garment]: {
          ...prev.standardSizes[garment],
          images: {
            ...prev.standardSizes[garment].images,
            [size]: value,
          },
        },
      },
    }));
  };

  // Update measurements string for garment and size
  const handleMeasurementChange = (garment, size, value) => {
    setFormData((prev) => ({
      ...prev,
      standardSizes: {
        ...prev.standardSizes,
        [garment]: {
          ...prev.standardSizes[garment],
          measurements: {
            ...prev.standardSizes[garment].measurements,
            [size]: value,
          },
        },
      },
    }));
  };

  // Update individual custom measurements array element
  const handleCustomMeasurementChange = (index, value) => {
    const updated = [...(formData.customMeasurements || [])];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, customMeasurements: updated }));
  };

  // On form submit, send updated formData back to parent onSave handler
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit Service</h2>

      {/* Service Name */}
      <input
        type="text"
        name="name"
        value={formData.name || ""}
        onChange={handleChange}
        placeholder="Service Name"
        className="border p-2 w-full mb-3 rounded"
        required
      />

      {/* Description */}
      <textarea
        name="description"
        value={formData.description || ""}
        onChange={handleChange}
        placeholder="Service Description"
        className="border p-2 w-full mb-3 rounded"
        rows={3}
      />

      {/* Base Price */}
      <input
        type="number"
        name="basePrice"
        value={formData.basePrice || ""}
        onChange={handleChange}
        placeholder="Base Price"
        className="border p-2 w-full mb-3 rounded"
        min={0}
        required
      />

      {/* Types */}
      <div className="mb-4">
        <p className="font-semibold text-gray-700">Types</p>
        <label className="mr-4">
          <input
            type="checkbox"
            checked={formData.types?.includes("standard")}
            onChange={() => handleTypeChange("standard")}
          />{" "}
          Standard
        </label>
        <label>
          <input
            type="checkbox"
            checked={formData.types?.includes("custom")}
            onChange={() => handleTypeChange("custom")}
          />{" "}
          Custom
        </label>
      </div>

      {/* Custom Measurements */}
      {formData.types?.includes("custom") && (
        <div className="mb-6">
          <p className="font-semibold text-gray-800">Custom Measurements</p>
          {(formData.customMeasurements || []).map((m, idx) => (
            <input
              key={idx}
              type="text"
              value={m}
              onChange={(e) => handleCustomMeasurementChange(idx, e.target.value)}
              className="border p-2 w-full mb-2 rounded"
            />
          ))}
        </div>
      )}

      {/* Standard Sizes */}
      {garmentTypes.map((garment) => (
        <div key={garment} className="mb-6">
          <p className="font-semibold text-gray-800">{garment}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(formData.standardSizes?.[garment]?.sizes || []).map((size) => (
              <div key={size} className="flex flex-col border p-3 rounded bg-gray-50 shadow-sm">
                <span className="font-medium text-sm mb-2">{size}</span>

                {/* Preview */}
                {formData.standardSizes?.[garment]?.images?.[size] && (
                  <img
                    src={formData.standardSizes[garment].images[size]}
                    alt={`${garment} ${size}`}
                    className="w-16 h-16 object-cover rounded mb-2"
                  />
                )}

                {/* Image Input */}
                <input
                  type="text"
                  placeholder="Image URL"
                  value={formData.standardSizes?.[garment]?.images?.[size] || ""}
                  onChange={(e) => handleImageChange(garment, size, e.target.value)}
                  className="border p-2 rounded mb-2 text-sm"
                />

                {/* Measurement Input */}
                <input
                  type="text"
                  placeholder="Measurement"
                  value={formData.standardSizes?.[garment]?.measurements?.[size] || ""}
                  onChange={(e) => handleMeasurementChange(garment, size, e.target.value)}
                  className="border p-2 rounded text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="bg-indigo-600 text-white px-6 py-2 rounded mt-4 hover:bg-indigo-700 transition"
      >
        Save Changes
      </button>
    </form>
  );
};

export default EditService;
