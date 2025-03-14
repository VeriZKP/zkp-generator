import { NextResponse } from "next/server";
import { PinataSDK } from "pinata-web3";

const fs = require("fs");
const snarkjs = require("snarkjs");

export const config = {
  runtime: "nodejs", // ✅ Ensure Node.js runtime
};

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY!,
});

// ✅ Temporary paths where files will be saved locally before usage
const wasmPath = "circom/position.wasm";
const zkeyPath = "circom/position_final.zkey";

// Function to generate a unique filename suffix
const generateUniqueSuffix = () => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
};

export async function POST(req: Request) {
  try {
    // const formData = await req.formData();
    // const institution = formData.get("institution") as string;
    // const position = formData.get("position") as string;
    // const name = formData.get("name") as string;
    // const idNumber = formData.get("idNumber") as string;

    const institution = "SIT";
    const position = "STUDENT";

    if (!institution || !position) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    // ✅ Prepare input for Circom circuit
    const input = {
      position: BigInt(position.length).toString(),
    };

    console.log("🚀 Generating proof with input:", input);

    // ✅ Generate Proof using SnarkJS
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );

    console.log("✅ Proof generated successfully.");

    // ✅ Prepare proof data for upload
    const proofData = {
      proof,
      publicSignals,
    };

    // ✅ Generate unique file name
    const uniqueSuffix = generateUniqueSuffix();
    const proofFileName =
      `proof_${institution}_${position}_${uniqueSuffix}.json`
        .replace(/\s+/g, "_")
        .replace(/[^\w.-]/g, "");

    // ✅ Convert JSON to Buffer (NO fs.writeFile)
    const proofBuffer = Buffer.from(JSON.stringify(proofData));

    // ✅ Convert metadata JSON to File
    const proofFile = new File([proofBuffer], proofFileName, {
      type: "application/json",
    });

    // ✅ Upload Metadata JSON to Pinata
    const proofUpload = await pinata.upload.file(proofFile);

    if (!proofUpload.IpfsHash) {
      return NextResponse.json(
        { error: "Metadata upload failed" },
        { status: 500 }
      );
    }

    console.log("✅ Proof uploaded to Pinata:", proofUpload.IpfsHash);

    // ✅ Return IPFS Hash to client
    return NextResponse.json({ ipfsHash: proofUpload.IpfsHash });
  } catch (error) {
    console.error("🚨 Error reading Pinata metadata:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
