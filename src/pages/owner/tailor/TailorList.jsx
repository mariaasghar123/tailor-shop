import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../context/AuthContext";

const TailorList = () => {
  const { user } = useAuth(); // current Owner
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTailors = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "tailor"),
          where("ownerId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const tailorData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Tailors fetched:", tailorData); // debug log

        setTailors(tailorData);
      } catch (error) {
        console.error("Error fetching tailors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTailors();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading tailors...</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">
        👔 My Tailors
      </h2>

      {tailors.length === 0 ? (
        <p className="text-gray-500">No tailors added yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tailors.map((tailor) => {
            // Handle both Timestamp and string for createdAt
            let createdAtFormatted = "N/A";
            if (tailor.createdAt) {
              if (typeof tailor.createdAt.toDate === "function") {
                createdAtFormatted = tailor.createdAt.toDate().toLocaleDateString();
              } else {
                createdAtFormatted = tailor.createdAt;
              }
            }

            return (
              <div
                key={tailor.id}
                className="bg-white shadow-md rounded-xl p-4 border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {tailor.name}
                </h3>
                <p className="text-sm text-gray-600">📧 {tailor.email}</p>
                <p className="text-sm text-gray-600">📞 {tailor.phone}</p>
                <p className="text-sm text-gray-600">🪡 {tailor.skills}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Added on {createdAtFormatted}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TailorList;
