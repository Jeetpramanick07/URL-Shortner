// Equivalent of app/scripts/seed_domains.py
const settings = require('../config');
const { Domain } = require('../models');
const { normalizeHostname } = require('../utils/host');

function makeDisplayName(hostname) {
  if (hostname === 'localhost') return 'Local Development';
  const words = hostname.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  return words.map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
}

async function seedDomains() {
  let created = 0;
  let existing = 0;

  for (const rawHostname of settings.seedDomainList) {
    const hostname = normalizeHostname(rawHostname);
    const found = await Domain.findOne({ where: { hostname } });
    if (found) {
      existing += 1;
      continue;
    }
    await Domain.create({
      hostname,
      display_name: makeDisplayName(hostname),
      is_active: true,
    });
    created += 1;
  }

  // eslint-disable-next-line no-console
  console.log(`Domain seed complete: ${created} created, ${existing} already present.`);
}

if (require.main === module) {
  seedDomains()
    .then(() => process.exit(0))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedDomains };
