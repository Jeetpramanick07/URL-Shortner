// Equivalent of app/routers/domains.py
const { Domain } = require('../models');
const { validateDomainCreate } = require('../validators/domain.validator');
const AppError = require('../utils/AppError');

async function listDomains(req, res) {
  const domains = await Domain.findAll({ order: [['hostname', 'ASC']] });
  res.json(domains.map(serializeDomain));
}

async function createDomain(req, res) {
  const payload = validateDomainCreate(req.body || {});

  const existing = await Domain.findOne({ where: { hostname: payload.hostname } });
  if (existing) {
    throw new AppError(409, 'A domain with this hostname already exists.');
  }

  const domain = await Domain.create({
    hostname: payload.hostname,
    display_name: payload.display_name,
    is_active: true,
  });
  res.status(201).json(serializeDomain(domain));
}

function serializeDomain(domain) {
  return {
    id: domain.id,
    hostname: domain.hostname,
    display_name: domain.display_name,
    is_active: domain.is_active,
    created_at: domain.created_at,
    updated_at: domain.updated_at,
  };
}

module.exports = { listDomains, createDomain };
