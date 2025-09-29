import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const CommonNavbar = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  // animation variants
  const navVariants = {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const linkVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.4 }
    })
  };

  // collect links according to role:
  const links = [
    { to: '/', text: 'Home' },
    ...(role === 'customer'
      ? [
          { to: '/shops', text: 'Shops' },
          { to: '/my-orders', text: 'My Orders' }
        ]
      : []),
    ...(role === 'owner'
      ? [
          { to: '/dashboard', text: 'Dashboard' },
          { to: '/allorders', text: 'Manage Orders' }
        ]
      : []),
    ...(role === 'tailor'
      ? [{ to: '/tailor-home', text: 'Tailor Panel' }]
      : []),
    { to: '/contact', text: 'Contact' }
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


      {/* Links */}
      <div className="space-x-4 flex  items-center">
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
            <motion.div custom={links.length + 1} variants={linkVariants} initial="hidden" animate="visible">
              <Link
                to="/login"
                className="text-white hover:text-indigo-600 transition-colors duration-300"
              >
                Login
              </Link>
            </motion.div>
            <motion.div custom={links.length + 2} variants={linkVariants} initial="hidden" animate="visible">
              <Link
                to="/signup"
                className="text-white hover:text-indigo-600 transition-colors duration-300"
              >
                Signup
              </Link>
            </motion.div>
          </>
        ) : (
          <motion.button
            custom={links.length + 1}
            variants={linkVariants}
            initial="hidden"
            animate="visible"
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-300"
          >
            Logout
          </motion.button>
        )}
      </div>
    </motion.nav>
  );
};

export default CommonNavbar;
