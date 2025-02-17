"use client";

import React from "react";

interface IdentityCardProps {
  name: string;
  id: string;
  title: string;
  organization: string;
  phone_number?: string;
  email?: string;
}

// Define institution color mappings
const institutionColors: {
  [key: string]: { color_1: string; color_2: string };
} = {
  SIT: { color_1: "#231F20", color_2: "#ED1C24" },
  UOB: { color_1: "#005EB8", color_2: "#ED1C24" },
  DEFAULT: { color_1: "#000000", color_2: "#FFFFFF" },
};

const IdentityCard: React.FC<IdentityCardProps> = ({
  name,
  id,
  title,
  organization,
  phone_number,
  email,
}) => {
  const { color_1, color_2 } =
    institutionColors[organization] || institutionColors["DEFAULT"];

  return (
    <div
      className="relative w-full aspect-[376/528] rounded-xl shadow-lg overflow-hidden text-white p-4"
      style={{
        background: `linear-gradient(45deg, ${color_1} 40%, ${color_2} 100%)`,
      }}
    >
      <div
        id="card-header"
        className="flex items-center justify-start w-full h-[10%]"
      >
        <span className="font-bold font-mono text-6xl ">
          {organization.toUpperCase()}
        </span>
      </div>
      <div
        id="card-body"
        className="flex flex-col items-center justify-center w-full h-[80%] "
      >
        <p className="font-bold text-2xl">{name}</p>
        <p className="text-md font-mono">{id}</p>
        {phone_number && <p className="text-md">📞 {phone_number}</p>}
        {email && <p className="text-md">✉️ {email}</p>}
      </div>
      <div
        id="card-footer"
        className="flex items-center justify-end w-full h-[10%]"
      >
        <span className="font-bold font-mono text-6xl">
          {title.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default IdentityCard;
