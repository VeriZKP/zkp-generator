"use client";

import { useState } from "react";
import { ethers } from "ethers";
import VerifierABI from "@/contracts/VerifierABI.json";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const VERIFIER_ADDRESS = "0xf815f8B28CC076B4A3879e45D7f20272D443d814";

export default function CheckoutPage() {
  const [studentId, setStudentId] = useState<number | null>(null);
  const [status, setStatus] = useState("Idle");

  const handleApplyDiscount = async () => {
    setStatus("🔄 Generating proof and verifying...");

    try {
      // 1. Call backend to get ZKP
      const response = await fetch("/api/generate-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      const { success, a, b, c, input } = await response.json();
      if (!success) throw new Error("Proof generation failed");

      console.log("🧾 studentId:", studentId);
      console.log("🧪 Proof a:", a);
      console.log("🧪 Proof b:", b);
      console.log("🧪 Proof c:", c);
      console.log("📤 input:", input);

      const publicOutput = ethers.BigNumber.from(input[2]).toNumber();
      if (publicOutput === 1) {
        setStatus("✅ Proof indicates a valid student ID. Discount applied.");
      } else if (publicOutput === 0) {
        setStatus("❌ Proof indicates an invalid student ID. Discount not applied.");
      } else {
        setStatus("⚠️ Unexpected public output: " + publicOutput);
      }


      // 2. Connect wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      // 3. Call smart contract
      const contract = new ethers.Contract(VERIFIER_ADDRESS, VerifierABI, signer);
      const tx = await contract.verifyStudentData(a, b, c, input);
      console.log("📤 Transaction hash:", tx.hash);

      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt.transactionHash);
      console.log("🔍 Logs:", receipt.logs);

      // 4. Decode VerificationResult(bool verified) event
      const iface = new ethers.Interface(VerifierABI);
      const verificationTopic = ethers.id("VerificationResult(bool)");

      const eventLog = receipt.logs.find(
        (log: any) =>
          log.topics[0] === verificationTopic &&
          log.address.toLowerCase() === VERIFIER_ADDRESS.toLowerCase()
      );

      if (!eventLog) {
        setStatus("❌ No verification event found.");
        return;
      }

      const decoded = iface.decodeEventLog(
        "VerificationResult",
        eventLog.data,
        eventLog.topics
      );
      console.log("📦 Full Decoded VerificationResult:", decoded);
      console.log("✅ Verified (direct access):", decoded.verified);


      const verified = decoded.verified; // ✅ fixed here
      console.log("✅ Event verified:", verified);

      if (!verified) {
        setStatus("❌ Invalid proof. Discount not applied.");
      } else {
        setStatus("✅ Proof verified! Discount applied.");
      }

      // (Optional) DebugInfo event
      const debugTopic = ethers.id("DebugInfo(string,uint256)");
      const debugLog = receipt.logs.find(
        (log: any) =>
          log.topics[0] === debugTopic &&
          log.address.toLowerCase() === VERIFIER_ADDRESS.toLowerCase()
      );

      if (debugLog) {
        const debugDecoded = iface.decodeEventLog(
          "DebugInfo",
          debugLog.data,
          debugLog.topics
        );
        console.warn("🐛 Debug Info:", debugDecoded.message, debugDecoded.value.toString());
      }
    } catch (error: any) {
      console.error("❌ Error during ZKP verification:", error);
      setStatus("❌ Error: " + error.message);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ZKP Discount Checkout</h1>

      <label className="block mb-2 text-sm text-gray-700">
        Enter Student ID:
      </label>
      <input
        className="border border-gray-300 px-3 py-2 rounded w-full mb-4"
        value={studentId ?? ""}
        onChange={(e) => setStudentId(Number(e.target.value))}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleApplyDiscount}
      >
        Apply Discount (ZKP)
      </button>

      <p className="mt-4 text-gray-700">Status: {status}</p>

    </div>
    
  );
}
