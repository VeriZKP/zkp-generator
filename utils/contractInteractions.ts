import { ethers } from "ethers";
import UserRegistrationABI from "./UserRegistration.json";

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
    UserRegistrationABI, // Ensure ABI is correctly structured
    signer || (await provider) // Await provider if MetaMask is used
  );
};

// ✅ Register a User
export const registerUser = async (
  adminSigner: ethers.Signer,
  userAddress: string,
  realName: string
) => {
  try {
    const contract = await getContract(adminSigner);
    const tx = await contract.registerUser(userAddress, realName);
    await tx.wait();
    console.log(`✅ User registered: ${realName} - ${userAddress}`);
  } catch (error) {
    console.error("❌ Error registering user:", error);
  }
};

// ✅ Fetch All Users (Without Institutions)
export const getAllUsers = async () => {
  try {
    const contract = await getContract();
    const [wallets, realNames] = await contract.getAllUsers();

    let usersData = [];
    for (let i = 0; i < wallets.length; i++) {
      usersData.push({
        wallet: wallets[i],
        realName: realNames[i],
      });
    }

    return usersData;
  } catch (error) {
    console.error("❌ Error fetching all users:", error);
    return [];
  }
};

// ✅ Add Institution
export const addInstitution = async (
  adminSigner: ethers.Signer,
  userAddress: string,
  preferredName: string,
  idNumber: string,
  title: string,
  institution: string,
  phone: string,
  email: string
) => {
  try {
    const contract = await getContract(adminSigner);
    const tx = await contract.addInstitution(
      userAddress,
      preferredName,
      idNumber,
      title,
      institution,
      phone,
      email
    );
    await tx.wait();
    console.log(`✅ Institution added: ${institution} - ${title}`);
  } catch (error) {
    console.error("❌ Error adding institution:", error);
  }
};

// ✅ Fetch All Users & Their Institutions
export const getAllUsersWithInstitutions = async () => {
  try {
    const contract = await getContract();
    const [wallets, realNames, institutions] =
      await contract.getAllUsersWithInstitutions();

    let usersData = [];
    for (let i = 0; i < wallets.length; i++) {
      for (const inst of institutions[i]) {
        usersData.push({
          wallet: wallets[i],
          realName: realNames[i],
          preferredName: inst.preferredName,
          idNumber: inst.idNumber,
          title: inst.title,
          institution: inst.institution,
          phone: inst.phoneNumber,
          email: inst.email,
        });
      }
    }

    return usersData;
  } catch (error) {
    console.error("❌ Error fetching users & institutions:", error);
    return [];
  }
};

// ✅ Fetch All Institutions of a User
export const getUserInstitutions = async (walletAddress) => {
  try {
    const contract = await getContract();
    const [realName, isRegistered, institutions] =
      await contract.getUserInstitutions(walletAddress);

    if (!isRegistered) {
      return null;
    }

    return {
      realName,
      isRegistered,
      institutions: institutions.map((inst) => ({
        preferredName: inst.preferredName,
        idNumber: inst.idNumber,
        title: inst.title,
        institution: inst.institution,
        phone: inst.phoneNumber,
        email: inst.email,
      })),
    };
  } catch (error) {
    console.error("❌ Error fetching user institutions:", error);
    return null;
  }
};
