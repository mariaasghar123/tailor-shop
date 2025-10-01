import React, { useState } from "react";
import ShopsList from "../ownershop/LIstShops";
import AllOrdersList from "../ownerorders/AllOrderList";
import ChatList from "../chat/ChatList";
import AddTailor from "../tailor/TailorAdd";
import TailorList from "../tailor/TailorList";
import { useNavigate } from "react-router-dom";

const OwnerDashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("shop");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const currentShopId = "SHOP123";

  const renderContent = () => {
    switch (activeTab) {
      case "shop":
        return <ShopsList />;
      case "orders":
        return <AllOrdersList />;
      case "chatList":
        return <ChatList shopId={currentShopId} />;
      case "addTailor":
        return <AddTailor />;
      case "tailorList":
        return <TailorList />;
      default:
        return <ShopsList />;
    }
  };

  const menuItems = [
    { key: "shop", label: "🏪 My Shop" },
    { key: "orders", label: "📦 Orders" },
    {
      key: "chatList",
      label: "💬 Chat",
      action: () =>
        navigate(
          "/owner/chat/UKG5G9Sq1jYE6PKA9iJv_1JCJEH8iUUWgoTjORQOqSUry5Nw2/message/ifjh0p9NKhauJ7NR9qwZ"
        ),
    },
    { key: "addTailor", label: "👔 Add Tailor" },
    { key: "tailorList", label: "📋 Tailor List" },
  ];

  const Sidebar = ({ isMobile = false }) => (
    <div className={`flex flex-col ${isMobile ? "bg-indigo-700 text-white" : "w-64 bg-indigo-700 text-white"} p-4`}>
      {menuItems.map((item) => (
        <button
          key={item.key}
          onClick={() => {
            if (item.action) item.action();
            else setActiveTab(item.key);
            if (isMobile) setMenuOpen(false);
          }}
          className={`block w-full text-left px-4 py-2 rounded hover:bg-indigo-600 transition-colors duration-200 ${
            activeTab === item.key ? "bg-indigo-600" : ""
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex justify-between items-center bg-indigo-700 text-white p-4">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-3xl focus:outline-none"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && <Sidebar isMobile />}

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">{<Sidebar />}</div>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-6 mt-0 md:mt-0 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default OwnerDashboardLayout;
