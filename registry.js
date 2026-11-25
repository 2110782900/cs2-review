"use strict";
const topics = [];
function registerTopic(topic) {
  const existing = topics.find(entry => entry.id === topic.id);
  if (existing) {
    existing.groups = [...new Set([...existing.groups, ...topic.groups])];
    existing.questions.push(...topic.questions);
  } else {
    topics.push(topic);
  }
}
function cleanAnswer(value) {
  return String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ");
}
function parseAnswer(value, mode) {
  const s = cleanAnswer(value);
  if (mode === "hex") {
    return /^(?:0x)?[0-9a-f]+$/i.test(s) ? BigInt("0x" + s.replace(/^0x/i, "")) : null;
  }
  if (/^0x[0-9a-f]+$/i.test(s)) return BigInt(s);
  if (/^[+-]?\d+$/.test(s)) return BigInt(s);
  if (/^[+-]?(?:\d+\.\d*|\.\d+)$/.test(s) && Number.isFinite(Number(s))) return Number(s);
  return null;
}
function fieldMatches(field, input) {
  if (!cleanAnswer(input)) return false;
  if (field.mode === "number" || field.mode === "hex") {
    const n = parseAnswer(input, field.mode);
    return n !== null && field.answers.some(a => {
      const expected = parseAnswer(a, field.mode);
      // Both operands were validated as numbers. Allow an integer answer such as 3.0.
      return expected !== null && n == expected;
    });
  }
  return field.answers.some(a => cleanAnswer(a) === cleanAnswer(input));
}
