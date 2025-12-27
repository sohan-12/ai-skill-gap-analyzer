require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

console.log("Environment Variables Check:");
console.log(
  "GOOGLE_CLIENT_ID:",
  process.env.GOOGLE_CLIENT_ID ? "Loaded ✓" : "Missing ✗"
);
console.log(
  "GOOGLE_CLIENT_SECRET:",
  process.env.GOOGLE_CLIENT_SECRET ? "Loaded ✓" : "Missing ✗"
);
console.log("");
console.log("Client ID:", process.env.GOOGLE_CLIENT_ID);
