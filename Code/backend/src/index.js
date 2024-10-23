// src/index.js
require("dotenv").config();
const mongoose = require("mongoose"); // Add this line
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const findAvailablePort = async (startPort) => {
  const net = require("net");

  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
};

const start = async () => {
  try {
    await connectDB();

    // Try to use preferred port, or find next available
    const availablePort = await findAvailablePort(PORT);

    app.listen(availablePort, () => {
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
      console.log(`Server running on port ${availablePort}`);
      if (availablePort !== PORT) {
        console.log(
          `Note: Original port ${PORT} was in use, using ${availablePort} instead`,
        );
      }
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  process.exit(1);
});

start();
