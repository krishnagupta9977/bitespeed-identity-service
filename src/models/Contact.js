import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  linkedId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Contacts', // Table name
      key: 'id',
    },
  },
  linkPrecedence: {
    type: DataTypes.ENUM('primary', 'secondary'),
    allowNull: false,
    defaultValue: 'primary',
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  // Yeh timestamps (createdAt, updatedAt) automatically handle karega
  timestamps: true,
  tableName: 'Contacts',
});

export { Contact };