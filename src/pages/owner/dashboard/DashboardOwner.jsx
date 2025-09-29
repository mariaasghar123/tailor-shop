import React, { useState } from "react";
import ShopsList from "../ownershop/LIstShops";
import AllOrdersList from "../ownerorders/AllOrderList";
import OwnerChat from "../chat/ChatOwner";
import ChatList from "../chat/ChatList";
import { useNavigate } from "react-router-dom";

const OwnerDashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("shop");
  const navigate = useNavigate();

  // ✅ Future me ye dynamic karo (shopId of logged-in owner)
  const currentShopId = "SHOP123";

  const renderContent = () => {
    switch (activeTab) {
      case "shop":
        return <ShopsList />;
      case "orders":
        return <AllOrdersList />;
      case "chatList": // ✅ ye tab ChatList show karega
        return <ChatList shopId={currentShopId} />;
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

          {/* ✅ Direct Chat page navigate karega */}
          <button
            onClick={() =>
              navigate(
                "/owner/chat/UKG5G9Sq1jYE6PKA9iJv_1JCJEH8iUUWgoTjORQOqSUry5Nw2/message/ifjh0p9NKhauJ7NR9qwZ"
              )
            }
            className={`block w-full text-left px-4 py-2 rounded hover:bg-indigo-600`}
          >
            💬 Chat
          </button>

          {/* ✅ Chat List tab */}
          {/* <button
            onClick={() => setActiveTab("chatList")}
            className={`block w-full text-left px-4 py-2 rounded hover:bg-indigo-600 ${
              activeTab === "chatList" && "bg-indigo-600"
            }`}
          >
            💬 Chat List
          </button> */}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6">{renderContent()}</div>
    </div>
  );
};

export default OwnerDashboardLayout;
