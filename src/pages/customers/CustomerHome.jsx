import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; // apne file path ke mutabiq change karo

const CustomerHomePage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState("");
  const [searchService, setSearchService] = useState("");
  const [filteredShops, setFilteredShops] = useState([]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const shopsCol = collection(db, "shops");
        const snapshot = await getDocs(shopsCol);
        const shopsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setShops(shopsList);
        setFilteredShops(shopsList);
      } catch (error) {
        console.error("Error fetching shops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  // Live search effect
  useEffect(() => {
    const filtered = shops.filter((shop) => {
  const cityMatch = shop.location?.toLowerCase().includes(searchCity.toLowerCase());

  const serviceMatch = (shop.services || []).some((s) =>
    s.name?.toLowerCase().includes(searchService.toLowerCase())
  );

  return cityMatch && serviceMatch;
});

    setFilteredShops(filtered);
  }, [searchCity, searchService, shops]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-500 to-indigo-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Find the Best Tailor Shops</h1>
          <p className="text-lg mb-6">
            Search tailor shops, place orders and track stitching progress easily.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-3">
            <input
              type="text"
              placeholder="Enter City"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="px-4 py-3 rounded-md outline-none text-black w-full md:w-1/3"
            />
            <input
              type="text"
              placeholder="Service Type"
              value={searchService}
              onChange={(e) => setSearchService(e.target.value)}
              className="px-4 py-3 rounded-md outline-none text-black w-full md:w-1/3"
            />
          </div>
        </div>
      </section>

      {/* Shop Cards Section */}
      <section className="py-12 max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Shops</h2>

        {loading ? (
          <div className="text-center py-6">Loading shops...</div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-6 text-gray-500 font-semibold">
            No shops found.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                <img
                  src={shop.image}
                  alt={shop.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{shop.name}</h3>
                  <p className="text-sm text-gray-600">{shop.location}</p>
                  <p className="text-sm text-gray-500">{shop.description}</p>
                  <p className="text-yellow-500">Rating: ★ {shop.rating}</p>
                  <Link to={`/shop/${shop.id}`}>
                    <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomerHomePage;
