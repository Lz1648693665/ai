export function parseVariables(content: string) {
  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  const result: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (!result.includes(match[1])) {
      result.push(match[1]);
    }
  }

  return result;
}

export function fillPrompt(content: string, values: Record<string, string>) {
  return content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    return values[key] ?? "";
  });
}
