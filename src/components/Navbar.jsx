import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react"; // hamburger icons

const CommonNavbar = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // animation variants
  const navVariants = {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const linkVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.4 },
    }),
  };

  // collect links according to role:
  const links = [
    { to: "/", text: "Home" },
    ...(role === "customer"
      ? [
          { to: "/shops", text: "Shops" },
          { to: "/my-orders", text: "My Orders" },
        ]
      : []),
    ...(role === "owner"
      ? [
          { to: "/dashboard", text: "Dashboard" },
          { to: "/allorders", text: "Manage Orders" },
        ]
      : []),
    ...(role === "tailor"
      ? [{ to: "/tailor-home", text: "Tailor Panel" }]
      : []),
    { to: "/contact", text: "Contact" },
  ];

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className="bg-gray-800 shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center space-x-2"
      >
        <img
          src="/media/tailor.jpg"
          alt="logo"
          className="h-16 w-auto object-contain rounded-full"
        />
        <span className="text-2xl font-bold text-indigo-600"></span>
      </motion.div>

      {/* Desktop Links */}
      <div className="hidden md:flex space-x-4 items-center">
        {links.map((link, i) => (
          <motion.div
            key={link.to}
            custom={i}
            variants={linkVariants}
            initial="hidden"
            animate="visible"
          >
            <Link
              to={link.to}
              className="text-white hover:text-indigo-600 transition-colors duration-300"
            >
              {link.text}
            </Link>
          </motion.div>
        ))}

        {/* Auth Buttons */}
        {!user ? (
          <>
            <Link
              to="/login"
              className="text-white hover:text-indigo-600 transition-colors duration-300"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-white hover:text-indigo-600 transition-colors duration-300"
            >
              Signup
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-300"
          >
            Logout
          </button>
        )}
      </div>

      {/* Mobile Hamburger Button */}
      <button
        className="md:hidden text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3 }}
          className="absolute top-16 right-0 w-2/3 h-screen bg-gray-900 p-6 flex flex-col space-y-4 md:hidden z-50"
        >
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="text-white hover:text-indigo-600 transition-colors duration-300"
            >
              {link.text}
            </Link>
          ))}

          {!user ? (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="text-white hover:text-indigo-600 transition-colors duration-300"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="text-white hover:text-indigo-600 transition-colors duration-300"
              >
                Signup
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
              className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors duration-300"
            >
              Logout
            </button>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default CommonNavbar;
