import React, { useState } from "react";
import ShopsList from "../ownershop/LIstShops";
import AllOrdersList from "../ownerorders/AllOrderList";
import ChatList from "../chat/ChatList";
import AddTailor from "../tailor/TailorAdd";
import TailorList from "../tailor/TailorList";
import { useNavigate } from "react-router-dom";

const OwnerDashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("shop");
  const navigate = useNavigate();

  // ✅ Future me ye dynamic hoga (shopId of logged-in owner)
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
      case "tailorList": // 👈 new case
        return <TailorList />;
      default:
        return <ShopsList />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white flex flex-col p-4">
        <h1 className="text-2xl font-bold mb-8">Owner Dashboard</h1>
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("shop")}
            className={`block w-full text-left px-4 py-2 rounded hover:bg-indigo-600 ${
              activeTab === "shop" && "bg-indigo-600"
            }`}
          >
            🏪 My Shop
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`block w-full text-left px-4 py-2 rounded hover:bg-indigo-600 ${
              activeTab === "orders" && "bg-indigo-600"
            }`}
          >
            📦 Orders
          </button>

          <button
            onClick={() =>
              navigate(
                "/owner/chat/UKG5G9Sq1jYE6PKA9iJv_1JCJEH8iUUWgoTjORQOqSUry5Nw2/message/ifjh0p9NKhauJ7NR9qwZ"
              )
            }
            className="block w-full text-left px-4 py-2 rounded hover:bg-indigo-600"
          >
            💬 Chat
          </button>

          {/* Add Tailor */}
          <button
            onClick={() => setActiveTab("addTailor")}
            className={`block w-full text-left px-4 py-2 rounded hover:bg-indigo-600 ${
              activeTab === "addTailor" && "bg-indigo-600"
            }`}
          >
            👔 Add Tailor
          </button>

          {/* Tailor List 👇 */}
          <button
            onClick={() => setActiveTab("tailorList")}
            className={`block w-full text-left px-4 py-2 rounded hover:bg-indigo-600 ${
              activeTab === "tailorList" && "bg-indigo-600"
            }`}
          >
            📋 Tailor List
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6">{renderContent()}</div>
    </div>
  );
};

export default OwnerDashboardLayout;
