const SECRET_PATTERNS = [
  { name: 'AWS Key', pattern: /AKIA[0-9A-Z]{16}/g },
  { name: 'Private Key', pattern: /-----BEGIN [A-Z]+ PRIVATE KEY-----/g },
  { name: 'JWT', pattern: /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/]*/g },
  { name: 'Generic Secret', pattern: /(?:secret|password|passwd|pwd|token|api[_-]?key)\s*[:=]\s*['"]?[^\s'"]{8,}/gi },
  { name: 'Database URL', pattern: /(?:postgres|mysql|mongodb):\/\/[^\s]+/gi },
];

export function detectSecrets(content: string): string[] {
  const found: string[] = [];
  for (const { name, pattern } of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      found.push(name);
    }
    pattern.lastIndex = 0;
  }
  return found;
}

export function highlightSecrets(content: string): string {
  let result = content;
  for (const { pattern } of SECRET_PATTERNS) {
    result = result.replace(pattern, (match) => `[REDACTED:${match.slice(0, 4)}...]`);
    pattern.lastIndex = 0;
  }
  return result;
}
