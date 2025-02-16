"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  registerUser,
  addInstitution,
  getAllUsersWithInstitutions,
} from "../../utils/testContractInteractions";

export default function Admin() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Wallet | null>(null);
  const [users, setUsers] = useState([]); // Users list
  const [institutions, setInstitutions] = useState([]); // Institutions list

  // ** User Registration Form State **
  const [userAddress, setUserAddress] = useState("");
  const [realName, setRealName] = useState("");

  // ** Add Institution Form State **
  const [institutionUser, setInstitutionUser] = useState(""); // Wallet Address
  const [preferredName, setPreferredName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [title, setTitle] = useState("Student"); // Default: Student
  const [institution, setInstitution] = useState("SIT");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // ** Connect Admin's Wallet **
  const connectGanache = async () => {
    try {
      const response = await fetch("/api/get-admin-pk");
      const data = await response.json();
      const privateKey = data.privateKey;

      if (!privateKey) {
        throw new Error("❌ Private key not found.");
      }

      const ganacheProvider = new ethers.JsonRpcProvider(
        "http://127.0.0.1:7545"
      );
      const wallet = new ethers.Wallet(privateKey, ganacheProvider);

      setProvider(ganacheProvider);
      setSigner(wallet);
      setWalletAddress(wallet.address);

      // Fetch users and institutions after connecting
      fetchUsers();
    } catch (error) {
      console.error("🚨 Connection error:", error);
    }
  };

  // ** Disconnect Wallet **
  const disconnectGanache = () => {
    setWalletAddress(null);
    setSigner(null);
    setUsers([]);
    setInstitutions([]);
  };

  // ** Fetch Users and Institutions **
  // ✅ Fetch Users
  const fetchUsers = async () => {
    const allUsers = await getAllUsersWithInstitutions();
    setUsers(allUsers);
  };

  // ✅ Handle Register User
  const handleRegisterUser = async () => {
    await registerUser(signer, userAddress, realName);
    fetchUsers();
  };

  // ✅ Handle Add Institution
  const handleAddInstitution = async () => {
    await addInstitution(
      signer,
      institutionUser,
      preferredName,
      idNumber,
      title,
      institution,
      phone,
      email
    );
    fetchUsers();
  };

  return (
    <div
      className="flex flex-col h-screen w-screen bg-white"
      style={{ boxShadow: "0 0 0 1px black" }}
    >
      <header
        className="flex items-center justify-between w-full h-[10%] px-16 gap-16"
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

      <main className="flex justify-center w-full flex-grow p-8 gap-8">
        <div id="forms" className="flex flex-col gap-8">
          {/* Register User Form */}
          <div className="p-6 border rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-center">
              Register User
            </h2>
            <input
              type="text"
              placeholder="User Wallet Address"
              className="border p-2 w-full mb-2"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
            />
            <input
              type="text"
              placeholder="Real Name"
              className="border p-2 w-full mb-2"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
            />
            <button
              onClick={handleRegisterUser}
              className="bg-blue-500 text-white px-4 py-2 rounded-md w-full"
            >
              Register User
            </button>
          </div>

          {/* Add Institution Form */}
          <div className="p-6 border rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-center">
              Add Institution
            </h2>
            <input
              type="text"
              placeholder="User Wallet Address"
              className="border p-2 w-full mb-2"
              value={institutionUser}
              onChange={(e) => setInstitutionUser(e.target.value)}
            />
            <input
              type="text"
              placeholder="Preferred Name"
              className="border p-2 w-full mb-2"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
            />
            <input
              type="text"
              placeholder="ID Number"
              className="border p-2 w-full mb-2"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
            />
            <select
              className="border p-2 w-full mb-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            >
              <option value="Student">Student</option>
              <option value="Intern">Intern</option>
              <option value="Professor">Professor</option>
            </select>
            <input
              type="text"
              placeholder="Institution Name"
              className="border p-2 w-full mb-2"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
            />
            <button
              onClick={handleAddInstitution}
              className="bg-green-500 text-white px-4 py-2 rounded-md w-full"
            >
              Add Institution
            </button>
          </div>
        </div>

        {/* Table Displaying All Users and Institutions */}
        <div id="table" className="w-full">
          <h2 className="text-xl font-bold mb-4">Users & Institutions</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Wallet</th>
                <th className="border border-gray-300 px-4 py-2">Real Name</th>
                <th className="border border-gray-300 px-4 py-2">
                  Institution
                </th>
                <th className="border border-gray-300 px-4 py-2">Title</th>
                <th className="border border-gray-300 px-4 py-2">ID Number</th>
              </tr>
            </thead>
            <tbody>
              {institutions.map((inst, index) => (
                <tr key={index} className="text-center">
                  <td className="border border-gray-300 px-4 py-2">
                    {inst.wallet}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {inst.realName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {inst.institution}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {inst.title}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {inst.idNumber}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
