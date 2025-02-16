require("dotenv").config();
import { ethers } from "ethers";
import UserRegistrationABI from "../build/contracts/UserRegistration.json";

// ✅ Load environment variables
// const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const contractAddress = "0x54424E3E93215511f80462Ca34bF4DB94FE402Bf";

if (!contractAddress) {
  throw new Error("❌ Contract address is missing. Check .env configuration.");
}

// ✅ Connect to Ganache or Other Network
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");

// ✅ Function to Get Contract Instance
const getContract = (signer?: ethers.Signer) => {
  return new ethers.Contract(
    contractAddress,
    UserRegistrationABI.abi,
    signer || provider
  );
};

// ✅ Register a New User (Wallet Address + Real Name)
export const registerUser = async (
  adminSigner: ethers.Signer,
  userAddress: string,
  realName: string
) => {
  try {
    console.log(adminSigner);

    if (!ethers.isAddress(userAddress)) {
      throw new Error("❌ Invalid user address format.");
    }

    const contract = getContract(adminSigner);

    const tx = await contract.registerUser(userAddress, realName);
    await tx.wait();
    console.log(
      `✅ User registered successfully: ${realName} - ${userAddress}`
    );

    return { success: true, message: "User registered successfully." };
  } catch (error) {
    console.error("❌ Error registering user:", error);
    return { success: false, error: error.message };
  }
};

// ✅ Add an Institution for a User
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
    if (!ethers.isAddress(userAddress)) {
      throw new Error("❌ Invalid user address format.");
    }

    const contract = getContract(adminSigner);

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
    console.log(`✅ Institution added for ${preferredName} at ${institution}`);

    return { success: true, message: "Institution added successfully." };
  } catch (error) {
    console.error("❌ Error adding institution:", error);
    return { success: false, error: error.message };
  }
};

// ✅ Fetch All Users with Their Institutions
export const getAllUsersWithInstitutions = async () => {
  try {
    const contract = getContract();

    const [wallets, realNames, institutions] =
      await contract.getAllUsersWithInstitutions();
    let usersData = [];

    for (let i = 0; i < wallets.length; i++) {
      usersData.push({
        wallet: wallets[i],
        realName: realNames[i],
        institutions: institutions[i].map((inst: any) => ({
          preferredName: inst.preferredName,
          idNumber: inst.idNumber,
          title: inst.title,
          institution: inst.institution,
          phone: inst.phoneNumber,
          email: inst.email,
        })),
      });
    }

    return usersData;
  } catch (error) {
    console.error("❌ Error fetching users & institutions:", error);
    return [];
  }
};
