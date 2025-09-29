import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import CommonNavbar from './components/Navbar';
import CommonFooter from './components/Footer';
import CustomerHomePage from './pages/customers/CustomerHome';
import ShopPage from './pages/customers/shops/ShopPage';
import MyOrders from './pages/customers/orders/OrderPage';
import OrderDetail from './pages/customers/orders/OrderDetail';
import AllShops from './pages/customers/shops/AllShop';
import ContactPage from './pages/customers/contact/ContactHome';
import Login from './pages/register/Login';
import Signup from './pages/register/Signup';
import OwnerDashboard from './pages/owner/dashboard/DashboardOwner.jsx';
import EditShop from './pages/owner/ownershop/EditShop.jsx';
import ShopsList from './pages/owner/ownershop/LIstShops.jsx';
import CreateShop from './pages/owner/ownershop/CreateShop.jsx';
import ViewShop from './pages/owner/ownershop/ViewShop.jsx';
import OrderList from './pages/owner/ownerorders/OrderList.jsx';
import AllOrdersList from './pages/owner/ownerorders/AllOrderList.jsx';
import OwnerChat from './pages/owner/chat/ChatOwner.jsx';
import TailorDashboard from './pages/tailor/TailorDashboard.jsx';
import TailorOrderDetail from './pages/tailor/TailorOrderDetails.jsx';

function AppContent() {
  const { role, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ✅ full screen wrapper */}
      <div className="flex flex-col min-h-screen">
        {/* header */}
        <CommonNavbar role={role} />

        {/* ✅ main will stretch */}
        <main className="flex-1">
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            {/* customer side */}
            <Route path="/" element={<CustomerHomePage />} />
            <Route path="/shops" element={<AllShops />} />
            <Route path="/shop/:shopId" element={<ShopPage />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/my-orders/:orderId" element={<OrderDetail />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* owner side */}
            <Route path="/dashboard" element={<OwnerDashboard />} />
            <Route path="/create_shop" element={<CreateShop />} />
            <Route path="/owner/:id/edit" element={<EditShop />} />
            <Route path="/shop_list" element={<ShopsList />} />
            <Route path="/shop_detail/:id" element={<ViewShop />} />
            <Route path="/order_list/:shopId" element={<OrderList />} />
            <Route path="/order_detail/:shopId" element={<OrderList />} />
            <Route path="/allorders" element={<AllOrdersList />} />
            <Route
              path="/owner/chat/:chatId/message/:messageId"
              element={<OwnerChat />}

            />

            {/* tailor side */}
            <Route path="/tailor-home" element={<TailorDashboard />} />
            <Route path="/tailor/orders/:orderId" element={<TailorOrderDetail />} />
          </Routes>
          
        </main>

        {/* ✅ footer hamesha neeche */}
        <CommonFooter />
      </div>
    </BrowserRouter>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}