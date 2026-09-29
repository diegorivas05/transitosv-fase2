try {
  process.loadEnvFile();  
} catch {
 
}

const esVerdadero = (v?: string) => v === 'true' || v === '1';

export const config = {
  backendUrl: (process.env.BACKEND_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  telemetryPath: process.env.TELEMETRY_PATH ?? '/api/telemetria',
  apiKey: process.env.IOT_API_KEY ?? '',
  intervalMs: Number(process.env.INTERVAL_MS ?? 3000),
  timeScale: Number(process.env.TIME_SCALE ?? 10),
  dryRun: esVerdadero(process.env.DRY_RUN) || process.argv.includes('--dry-run'),
  inactiveUnits: (process.env.INACTIVE_UNITS ?? '9')
    .split(',')
    .map((n) => Number(n.trim()))
    .filter((n) => Number.isInteger(n) && n > 0),
};
