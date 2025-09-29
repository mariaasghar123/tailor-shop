import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../../firebase'

const AllShops = () => {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShops = async () => {
      try {
        // shops collection ka reference
        const shopsCol = collection(db, 'shops')
        // sare docs fetch karna
        const snapshot = await getDocs(shopsCol)

        // docs ko array me convert karna
        const shopsList = snapshot.docs.map(doc => ({
          id: doc.id,       // document id
          ...doc.data()     // document ka data
        }))
        setShops(shopsList)
      } catch (error) {
        console.error('Error fetching shops:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchShops()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading shops...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">All Shops</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {shops.map(shop => (
            <div
              key={shop.id}
              className="bg-white shadow-md rounded-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={shop.image}
                alt={shop.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold">{shop.name}</h2>
                <p className="text-gray-600">{shop.location}</p>
                <p className="text-yellow-500">Rating: ★ {shop.rating}</p>
                <p className="text-gray-500">{shop.description}</p>
                <Link
                  to={`/shop/${shop.id}`}
                  className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AllShops
