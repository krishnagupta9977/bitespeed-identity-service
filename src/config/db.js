import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// SQL Connection Setup
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Console par faltu queries na dikhe isliye
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Render/Aiven jaise hosted DBs ke liye zaruri hai
    }
  }
});

const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQL Database connected successfully.');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

export { sequelize };
export default connectDb;