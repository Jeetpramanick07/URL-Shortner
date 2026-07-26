// Equivalent of app/services/rotation_service.py

/**
 * Atomically advance the PostgreSQL counter and select the used keyword.
 * Must run inside the same transaction as the click_event insert (the
 * caller in services/redirectService.js wraps both in one `sequelize.transaction`).
 */
async function advanceAndSelectKeyword(sequelize, { linkId, keywords, transaction }) {
  const [rows] = await sequelize.query(
    'UPDATE links SET click_sequence = click_sequence + 1 WHERE id = :linkId RETURNING click_sequence',
    { replacements: { linkId }, transaction }
  );
  const newSequence = Number(rows[0].click_sequence);
  const sequenceUsed = newSequence - 1;
  const keywordIndex = sequenceUsed % keywords.length;
  return { sequenceUsed, keywordIndex, keyword: keywords[keywordIndex] };
}

function selectKeywordWithoutIncrement({ clickSequence, keywords }) {
  const keywordIndex = Number(clickSequence) % keywords.length;
  return { sequenceUsed: Number(clickSequence), keywordIndex, keyword: keywords[keywordIndex] };
}

module.exports = { advanceAndSelectKeyword, selectKeywordWithoutIncrement };
