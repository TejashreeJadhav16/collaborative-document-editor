const { sequelize } = require('../config/database');
const User = require('./User');
const Document = require('./Document');
const SharedDocument = require('./SharedDocument');

// Associations
User.hasMany(Document, { foreignKey: 'owner_id', as: 'ownedDocuments' });
Document.belongsTo(User, { foreignKey: 'owner_id', as: 'Owner' });

Document.hasMany(SharedDocument, { foreignKey: 'document_id', as: 'shares', onDelete: 'CASCADE' });
SharedDocument.belongsTo(Document, { foreignKey: 'document_id' });

User.hasMany(SharedDocument, { foreignKey: 'user_id', as: 'sharedWithMe' });
SharedDocument.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Document,
  SharedDocument
};
