const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SharedDocument = sequelize.define('SharedDocument', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  document_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  permission: {
    type: DataTypes.ENUM('read', 'write'),
    allowNull: false,
    defaultValue: 'read',
    validate: {
      isIn: [['read', 'write']]
    }
  }
}, {
  tableName: 'shared_documents',
  timestamps: true,
  underscored: true
});

module.exports = SharedDocument;
