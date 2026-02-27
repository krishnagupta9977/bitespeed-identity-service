import app from "./src/app.js";
import connectDB, { sequelize } from "./src/config/db.js";
// Import the model to ensure Sequelize registers the 'Contacts' table
import "./src/models/Contact.js"; 

import dotenv from "dotenv";
dotenv.config();

const startServer = async () => {
  try {
    // 1. Establish connection with the SQL database
    await connectDB();

    // 2. Sync models with the database
    // { alter: true } checks the current state of the DB and performs necessary updates to match the model
    await sequelize.sync({ alter: true });
    console.log("SQL Database synced and table created successfully.");

    // 3. Start the Express server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Critical error during server startup:", error);
    process.exit(1);
  }
};

startServer();