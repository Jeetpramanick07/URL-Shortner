// Equivalent of app/models/click_event.py — maps onto the existing "click_events" table.
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database');

class ClickEvent extends Model {}

ClickEvent.init(
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    link_id: { type: DataTypes.UUID, allowNull: false },
    clicked_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    keyword_used: { type: DataTypes.STRING(100), allowNull: true },
    keyword_position: { type: DataTypes.INTEGER, allowNull: false },
    request_method: { type: DataTypes.STRING(10), allowNull: false },
    user_agent: { type: DataTypes.TEXT, allowNull: true },
    referrer: { type: DataTypes.TEXT, allowNull: true },
    ip_hash: { type: DataTypes.STRING(64), allowNull: true },
    classification: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'unknown' },
    device_category: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'unknown' },
    operating_system: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'unknown' },
    browser: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'unknown' },
    device_family: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'unknown' },
    country: { type: DataTypes.STRING(10), allowNull: true },
    city: { type: DataTypes.STRING(255), allowNull: true },
    language: { type: DataTypes.STRING(35), allowNull: false, defaultValue: 'unknown' },
    referrer_domain: { type: DataTypes.STRING(255), allowNull: false, defaultValue: 'direct' },
    visitor_hash: { type: DataTypes.STRING(64), allowNull: true },
    is_bot: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    is_preview: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    is_prefetch: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    is_human: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  {
    sequelize,
    modelName: 'ClickEvent',
    tableName: 'click_events',
    timestamps: false,
    underscored: true,
  }
);

module.exports = ClickEvent;
