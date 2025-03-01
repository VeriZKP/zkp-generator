import { ethers } from "ethers";
import SoulboundABI from "./Soulbound.json";

let contractAddress: string | null = null; // Store the contract address after first fetch

// ✅ Function to Fetch Contract Address Securely
const fetchContractAddress = async () => {
  if (!contractAddress) {
    try {
      const response = await fetch("/api/get-contract-address");
      const data = await response.json();
      contractAddress = data.contractAddress;

      if (!contractAddress) {
        throw new Error("❌ Contract address is missing.");
      }
    } catch (error) {
      console.error("❌ Error fetching contract address:", error);
      throw error;
    }
  }
  return contractAddress;
};

// ✅ Function to Get Provider (MetaMask or Ganache)
const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum); // MetaMask Provider
  } else {
    return new ethers.JsonRpcProvider("http://127.0.0.1:7545"); // Ganache Fallback
  }
};

// ✅ Function to Get Smart Contract Instance
const getContract = async (signer?: ethers.Signer) => {
  const provider = getProvider();
  const contractAddr = await fetchContractAddress(); // Ensure contract address is fetched

  return new ethers.Contract(
    contractAddr,
    SoulboundABI, // Ensure ABI is correctly structured
    signer || (await provider.getSigner()) // Await provider if MetaMask is used
  );
};

// ============================================================= //
// ========== [1] Fetch All Tokens Received by User ============ //
// ============================================================= //
export const getAllReceivedTokens = async (signer: ethers.Signer) => {
  try {
    const contract = await getContract(signer);
    const tokens = await contract.getAllReceivedTokenDetails();

    return tokens.map((token: any) => ({
      owner: token.owner,
      tokenId: token.tokenId.toString(),
      slot: token.slot.toString(),
      revoked: token.revoked,
      metadataURI: token.metadataURI,
    }));
  } catch (error) {
    console.error("❌ Error fetching user institutions:", error);
    return null;
  }
};
