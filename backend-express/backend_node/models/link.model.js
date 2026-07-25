// Equivalent of app/models/link.py — maps onto the existing "links" table.
// All CHECK constraints (asin format, slug format, keywords array length,
// target_country whitelist, click_sequence >= 0) already exist in the
// database from the original Alembic migration and are left untouched;
// application-level validation (validators/link.validator.js) mirrors them
// so the same friendly error messages are returned before ever hitting the DB.
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database');

class Link extends Model {}

Link.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    domain_id: { type: DataTypes.INTEGER, allowNull: false },
    slug: { type: DataTypes.STRING(80), allowNull: false },
    asin: { type: DataTypes.STRING(10), allowNull: false },
    target_country: { type: DataTypes.STRING(2), allowNull: false },
    keywords: { type: DataTypes.JSONB, allowNull: false },
    associate_tag: { type: DataTypes.STRING(100), allowNull: true },
    click_sequence: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    expires_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'Link',
    tableName: 'links',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [{ unique: true, fields: ['domain_id', 'slug'] }],
  }
);

module.exports = Link;
