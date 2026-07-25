// Equivalent of app/models/domain.py — maps onto the existing "domains" table.
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database');

class Domain extends Model {}

Domain.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    hostname: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    display_name: { type: DataTypes.STRING(255), allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'Domain',
    tableName: 'domains',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  }
);

module.exports = Domain;
