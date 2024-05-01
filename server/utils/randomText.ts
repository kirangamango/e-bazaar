import crypto from "crypto";

// Function to generate a random hex string of given length
export function generateRandomHexString(length: number) {
  // Calculate the number of bytes needed for the hex string
  const byteLength = Math.ceil(length / 2);

  // Generate random bytes
  const buffer = crypto.randomBytes(byteLength);

  // Convert bytes to hex string
  const hexString = buffer.toString("hex").slice(0, length);

  return hexString;
}

// Usage example: generate a random hex string of length 16
const randomHexString = generateRandomHexString(16);
console.log(randomHexString);
