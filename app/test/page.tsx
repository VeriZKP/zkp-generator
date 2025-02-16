"use client";
require("dotenv").config();
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getUserInstitutions } from "../../utils/testContractInteractions";
import { motion } from "framer-motion";
import IdentityCard from "../component/identityCard";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInfo, setUserInfo] = useState([]); // Ensure this is an array
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      fetchUserData(walletAddress);
    }
  }, [walletAddress]);

  const connectGanache = async () => {
    try {
      // Fetch private key from API
      const response = await fetch("/api/get-user-pk");
      const data = await response.json();
      const privateKey = data.privateKey;

      if (!privateKey) {
        throw new Error("❌ Private key not found.");
      }

      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
      const wallet = new ethers.Wallet(privateKey, provider);

      setWalletAddress(wallet.address);
      fetchUserData(wallet.address);
    } catch (error) {
      console.error("🚨 Connection error:", error);
    }
  };

  // ✅ Fetch user details from smart contract
  const fetchUserData = async (address) => {
    setLoading(true);
    const data = await getUserInstitutions(address);

    if (data) {
      setUserInfo(data.institutions);
      console.log(data.institutions);
    } else {
      setUserInfo([]);
    }
    setLoading(false);
  };

  const disconnectGanache = () => {
    setWalletAddress(null); // Clears wallet address
    setUserInfo([]);
  };

  // ✅ Navigation Functions
  const nextCard = () => {
    if (userInfo.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % userInfo.length);
    }
  };

  const prevCard = () => {
    if (userInfo.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + userInfo.length) % userInfo.length);
    }
  };

  return (
    <div
      id="device-setter"
      className="flex flex-col sm:h-screen sm:w-[calc(100vh*(440/956))] min-w-[440px] bg-white"
      style={{ boxShadow: "0 0 0 1px black" }}
    >
      {/* 🔹 Header */}
      <header
        className="flex items-center justify-between w-full h-[10%] p-4 gap-4"
        style={{ boxShadow: "0 0 0 1px black" }}
      >
        <p className="truncate text-lg max-w-[70%]">
          Wallet:{" "}
          <span className="font-semibold">
            {walletAddress ? walletAddress : "Not connected"}
          </span>
        </p>
        <button
          onClick={walletAddress ? disconnectGanache : connectGanache}
          className={`px-4 py-2 rounded-lg ${
            walletAddress
              ? "bg-[#FF9E9E] hover:bg-red-500 text-white"
              : "bg-[#9EFFA5] hover:bg-green-500 text-white"
          }`}
        >
          {walletAddress ? "Disconnect" : "Connect"}
        </button>
      </header>

      {/* 🔹 Main Content Section */}
      <main className="flex items-center justify-center w-full flex-grow relative p-8">
        {loading ? (
          <p>Loading User Data...</p>
        ) : userInfo.length > 0 ? (
          <div className="relative w-full h-full overflow-x-hidden">
            {/* Motion Container */}
            <motion.div
              className="flex h-auto"
              animate={{ x: `-${currentIndex * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {userInfo.map((identity, index) => (
                <div key={index} className="flex justify-center min-w-full">
                  <IdentityCard
                    name={identity.preferredName}
                    id={identity.idNumber}
                    title={identity.title}
                    organization={identity.institution}
                    phone_number={identity.phone}
                    email={identity.email}
                  />
                </div>
              ))}
            </motion.div>

            {/* Navigation Buttons */}
            {userInfo.length > 1 && (
              <div
                id="buttons"
                className="flex justify-between items-center w-full flex-grow mt-8"
              >
                <button
                  className="flex items-center justify-center w-12 aspect-square bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700"
                  onClick={prevCard}
                >
                  ◀
                </button>

                {/* Generate Proof Button (Centered) */}
                <button
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white text-2xl font-semibold rounded-lg shadow-md hover:bg-blue-800"
                  onClick={() => {}}
                >
                  Generate Proof
                </button>

                <button
                  className="flex items-center justify-center w-12 aspect-square bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700"
                  onClick={nextCard}
                >
                  ▶
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-red-500">No registered institutions found.</p>
        )}
      </main>

      <footer className="flex items-center justify-center w-full h-[10%] p-4 border-t"></footer>
    </div>
  );
}
