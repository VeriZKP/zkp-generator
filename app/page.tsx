"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { getAllReceivedTokens } from "../utils/contractInteractions";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

// ✅ Define NFT Metadata Type
type NFTMetadata = {
  name: string;
  id_masked: string;
  id_hashed: string;
  institution: string;
  position: string;
  image: string;
};

// ✅ Define NFT Type
interface NFT {
  walletAddress: string;
  metadata: NFTMetadata | null;
  metadataURI: string;
  tokenId: string;
  revoked: boolean;
}

export default function User() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("🚨 Connection error:", error);
      }
    } else {
      alert("❌ MetaMask is not installed! Please install it.");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null); // Clears wallet address
    setUserNFTs([]);
  };

  // ✅ Fetch user NFTs from smart contract
  const fetchNFTs = async () => {
    try {
      if (!window.ethereum) {
        alert("❌ MetaMask is required to fetch NFTs.");
        return;
      }

      setLoading(true);

      // ✅ Connect to MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // ✅ Fetch all issued NFTs from smart contract
      const tokens = await getAllReceivedTokens(signer);

      // ✅ Create dictionary with metadata set to null initially
      const tokenDataList: NFT[] = tokens.map(
        (token: {
          owner: string;
          metadataURI: string;
          tokenId: string;
          revoked: boolean;
        }) => ({
          walletAddress: token.owner,
          metadata: null, // Will be filled after fetching metadata
          metadataURI: token.metadataURI, // Store metadata URI for fetching later
          tokenId: token.tokenId,
          revoked: token.revoked,
        })
      );

      // ✅ Extract IPFS Hashes from metadataURIs
      const ipfsHashes = tokens.map(
        (token: {
          owner: string;
          metadataURI: string;
          tokenId: string;
          revoked: boolean;
        }) => token.metadataURI.replace("ipfs://", "")
      );

      const response = await fetch("/api/read-pinata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ipfsHashes }),
      });

      const metadataList = await response.json();

      const updatedTokenDataList: NFT[] = tokenDataList.map(
        (tokenData, index) => ({
          ...tokenData,
          metadata: metadataList[index] || null, // Assign metadata if available
        })
      );

      console.log(updatedTokenDataList);

      setUserNFTs(updatedTokenDataList);
    } catch (error) {
      console.error("🚨 Error fetching NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = () => {
    setQrValue("YaoHao was gay before he met P"); // Placeholder content for now
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // ✅ Navigation Functions
  const nextCard = () => {
    if (userNFTs.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % userNFTs.length);
    }
  };

  const prevCard = () => {
    if (userNFTs.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + userNFTs.length) % userNFTs.length);
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen sm:w-[440px] bg-white overflow-hidden border">
      <header className="flex items-center justify-between w-full h-[10%] p-4 border-b">
        <p className="truncate text-lg max-w-[60%]">
          Wallet:{" "}
          <span className="font-semibold">
            {walletAddress || "Not connected"}
          </span>
        </p>
        <button
          onClick={walletAddress ? disconnectWallet : connectWallet}
          className={`px-4 py-2 rounded-lg transition-colors ${
            walletAddress ? "bg-red-500" : "bg-green-500"
          } text-white`}
        >
          {walletAddress ? "Disconnect" : "Connect"}
        </button>
      </header>

      <main className="flex flex-col items-center justify-center w-full flex-grow relative p-8">
        <button
          className="px-4 py-2 mb-4 bg-gray-600 text-white rounded-lg hover:bg-gray-800"
          onClick={fetchNFTs}
        >
          Refresh Data
        </button>
        {loading ? (
          <p>Loading User Data...</p>
        ) : userNFTs.length > 0 ? (
          <div className="relative w-full h-full overflow-x-hidden">
            <motion.div
              className="flex h-auto"
              animate={{ x: `-${currentIndex * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {userNFTs.map((nft, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center min-w-full"
                >
                  <img
                    src={nft.metadata?.image}
                    alt={nft.metadata?.name}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <div className="flex flex-col items-center w-[80%] mt-4 p-4 bg-white rounded-lg shadow-md">
                    <div className="flex justify-between w-full">
                      <span>Institution:</span>{" "}
                      <span className="w-[50%] text-left">
                        {nft.metadata?.institution}
                      </span>
                    </div>
                    <div className="flex justify-between w-full">
                      <span>Position:</span>{" "}
                      <span className="w-[50%] text-left">
                        {nft.metadata?.position}
                      </span>
                    </div>
                    <div className="flex justify-between w-full">
                      <span>Name:</span>{" "}
                      <span className="w-[50%] text-left">
                        {nft.metadata?.name}
                      </span>
                    </div>
                    <div className="flex justify-between w-full">
                      <span>ID (Hashed):</span>{" "}
                      <span className="w-[50%] text-left truncate">
                        {nft.metadata?.id_hashed}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
            <div className="flex items-center justify-between w-full mt-4">
              {userNFTs.length > 1 && (
                <button
                  className="w-[20%] aspect-square bg-gray-800 text-2xl text-white rounded-full shadow-md hover:bg-gray-700"
                  onClick={prevCard}
                >
                  ◀
                </button>
              )}

              {userNFTs.length > 1 && (
                <button
                  className="w-[20%] aspect-square bg-gray-800 text-2xl text-white rounded-full shadow-md hover:bg-gray-700"
                  onClick={nextCard}
                >
                  ▶
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-red-500">No registered institutions found.</p>
        )}
      </main>
      <footer className="flex items-center justify-center w-full h-[10%] p-4 border-b">
        <button
          className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-800"
          onClick={generateQRCode}
        >
          Generate QR Code
        </button>
      </footer>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg w-[60%] md:w-[20%]">
            <QRCodeSVG value={qrValue || ""} size={200} />
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
