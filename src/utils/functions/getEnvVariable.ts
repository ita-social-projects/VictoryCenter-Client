export function getEnvVariable(varName: keyof NodeJS.ProcessEnv, fallback?: string): string {
  const value = process.env[varName] ?? fallback;
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing environment variable: ${varName}`);
  }
  return value;
}
