import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, firebaseConfig } from "../../../firebase";
import { useAuth } from "../../../context/AuthContext";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
    import { setPersistence, inMemoryPersistence } from "firebase/auth";


// Main Auth instance le rahe hain taake Owner ka session check kar sakein
const mainAuth = getAuth(); 

const AddTailor = () => {
    const { user } = useAuth(); // 👈 Owner logged in

    const secondaryApp =
        getApps().find((app) => app.name === "Secondary") ||
        initializeApp(firebaseConfig, "Secondary");

    const secondaryAuth = getAuth(secondaryApp);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [skills, setSkills] = useState("");
    const [password, setPassword] = useState("");

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     if (!user) return;

    //     try {
    //         // 1️⃣ Tailor ka account create karo (secondary auth)
    //         // Is step mein Owner ka session temporary taur par disturb ho sakta hai,
    //         // khaaskar agar AuthContext sirf Auth state change par rely karta hai.
    //         const userCredential = await createUserWithEmailAndPassword(
    //             secondaryAuth,
    //             email,
    //             password
    //         );

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!user) return;

  try {
    // Set secondary auth persistence to in-memory (non-persistent)
    await setPersistence(secondaryAuth, inMemoryPersistence);

    // Now create tailor user with secondary auth
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password
    );

    // ... rest of your code


            const tailorUser = userCredential.user;

            // 2️⃣ Firestore me save karo
            await setDoc(doc(db, "users", tailorUser.uid), {
                ownerId: user.uid,
                uid: tailorUser.uid,
                name,
                email,
                phone,
                skills,
                role: "tailor",
                createdAt: serverTimestamp(),
            });

            // 3️⃣ Secondary se logout (Tailor ko logout karega)
            await signOut(secondaryAuth);
            
            // ✅ FIX: Owner ke main session ko force refresh karo
            // Ye main Auth instance se current user (Owner) ko force karta hai ki woh apna token refresh kare.
            // Ye 'onAuthStateChanged' listener ko dobara trigger karega aur Owner ke session ko restore karega.
            if (mainAuth.currentUser) {
                await mainAuth.currentUser.reload();
            }
            // Agar AuthContext mein koi listener hai, toh woh ab Owner ko login state mein rakhega.


            alert("✅ Tailor added successfully! Owner session restored.");
            setName("");
            setEmail("");
            setPhone("");
            setSkills("");
            setPassword("");
        } catch (error) {
            console.error("Error adding tailor: ", error);
            // Agar error aaye to Owner ka session check karna zaroori hai
            if (mainAuth.currentUser) {
                await mainAuth.currentUser.reload();
            }
            alert("❌ Error: " + error.message);
        }
    };

    // ... (rest of the return structure is the same)
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 space-y-5 border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-center text-indigo-700">
              👔 Add Tailor
            </h2>
    
            {/* Name */}
            <input
              type="text"
              placeholder="Tailor Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border p-2 rounded-lg"
            />
    
            {/* Email */}
            <input
              type="email"
              placeholder="Tailor Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border p-2 rounded-lg"
            />
    
            {/* Phone */}
            <input
              type="text"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />
    
            {/* Skills */}
            <input
              type="text"
              placeholder="Skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />
    
            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border p-2 rounded-lg"
            />
    
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg"
            >
              Add Tailor
            </button>
          </form>
        </div>
      );
};

export default AddTailor;