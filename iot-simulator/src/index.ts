// Punto de entrada: cada INTERVAL_MS genera una lectura por unidad y la envía al backend.
import { config } from './config.js';
import { crearFlota } from './simulator.js';

const flota = crearFlota();
const url = `${config.backendUrl}${config.telemetryPath}`;
let enviados = 0;
let fallidos = 0;

const hora = () => new Date().toLocaleTimeString('es-SV', { hour12: false });

console.log('=== Simulador IoT TránsitoSV ===');
console.log(`Modo:       ${config.dryRun ? 'DRY-RUN (no envía nada)' : 'ENVÍO REAL'}`);
console.log(`Destino:    POST ${url}`);
console.log(`Unidades:   ${flota.length} | Intervalo: ${config.intervalMs} ms | Escala de tiempo: x${config.timeScale}`);
if (!config.dryRun && !config.apiKey) console.warn('Aviso: IOT_API_KEY vacío, se enviará sin x-api-key.');
console.log('Ctrl + C para detener\n');

async function enviar(lectura: ReturnType<(typeof flota)[number]['lectura']>): Promise<string> {
  if (config.dryRun) return 'dry-run';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': config.apiKey },
      body: JSON.stringify(lectura),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) enviados++;
    else fallidos++;
    return String(res.status);
  } catch (err) {
    fallidos++;
    return `ERROR (${(err as Error).cause ? String((err as Error).cause) : (err as Error).message})`;
  }
}

async function tick() {
  const dtSeg = config.intervalMs / 1000;
  await Promise.all(
    flota.map(async (u) => {
      u.avanzar(dtSeg);
      const l = u.lectura();
      const resultado = await enviar(l);
      console.log(
        `[${hora()}] U${String(l.id_unidad).padStart(2)} R${u.idRuta} | ` +
          `${l.latitud.toFixed(6)}, ${l.longitud.toFixed(6)} | ` +
          `${l.velocidad.toFixed(1).padStart(5)} km/h | ${l.estado.padEnd(9)} -> ${resultado}`,
      );
    }),
  );
}

const timer = setInterval(tick, config.intervalMs);
void tick();

process.on('SIGINT', () => {
  clearInterval(timer);
  console.log(`\nDetenido. Envíos correctos: ${enviados} | fallidos: ${fallidos}`);
  process.exit(0);
});
