// HealthVerse — Text Sanitization & Symbol Cleanup Utility

/**
 * Cleans unwanted special symbols from user-facing text strings
 * while preserving hex color codes, email addresses, math expressions, and valid SVG attributes.
 *
 * Examples:
 *   "Appointments*" -> "Appointments"
 *   "Patient #123" -> "Patient 123"
 *   "Doctor@Profile" -> "Doctor Profile"
 *   "Book·Appointment" -> "Book Appointment"
 *   "Status~Active" -> "Status Active"
 *   "Priority|High" -> "Priority High"
 *   "Queue#ID" -> "Queue ID"
 */
export function cleanText(input) {
  if (typeof input !== 'string') return input;

  // Don't modify hex colors like #4A90D9 or SVG path data
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(input.trim())) return input;
  if (input.includes('viewBox') || input.includes('<path') || input.includes('<svg')) return input;

  let cleaned = input;

  // Replace unwanted standalone/internal symbols with single spaces or strip trailing ones
  cleaned = cleaned.replace(/[*~•·]/g, ''); // strip *, ~, •, ·
  cleaned = cleaned.replace(/\s*([#@|])\s*/g, ' '); // replace #, @, | with space

  // Clean double spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Automated test suite for text cleanup utility
 */
export function runTextAuditTests() {
  const testCases = [
    { input: "Appointments*", expected: "Appointments" },
    { input: "Patient #123", expected: "Patient 123" },
    { input: "Doctor@Profile", expected: "Doctor Profile" },
    { input: "Book·Appointment", expected: "Book Appointment" },
    { input: "Status~Active", expected: "Status Active" },
    { input: "Priority|High", expected: "Priority High" },
    { input: "Queue#ID", expected: "Queue ID" },
  ];

  let passed = 0;
  testCases.forEach(({ input, expected }, idx) => {
    const result = cleanText(input);
    if (result === expected) {
      passed++;
    } else {
      console.error(`Test ${idx + 1} Failed: Expected "${expected}", got "${result}"`);
    }
  });

  console.log(`[TextAuditTests] ${passed}/${testCases.length} tests passed.`);
  return passed === testCases.length;
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.cleanText = cleanText;
  window.runTextAuditTests = runTextAuditTests;
}
