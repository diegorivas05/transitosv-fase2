import http from 'node:http';

try {
  process.loadEnvFile();
} catch {
  
}

const PUERTO = Number(process.env.MOCK_PORT ?? 4000);
 const RUTA = process.env.TELEMETRY_PATH ?? '/api/unidades/telemetria';
const API_KEY = process.env.IOT_API_KEY ?? '';

const ultimas = new Map<number, unknown>();

const servidor = http.createServer((req, res) => {
  const json = (codigo: number, cuerpo: unknown) => {
    res.writeHead(codigo, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(cuerpo));
  };

  if (req.method === 'GET' && req.url === '/api/unidades/ultimas') {
    return json(200, [...ultimas.values()]);
  }

  if (req.method !== 'POST' || req.url !== RUTA) return json(404, { error: 'No encontrado' });

  if (API_KEY && req.headers['x-api-key'] !== API_KEY) {
    console.log('401 - x-api-key inválida');
    return json(401, { error: 'API key inválida' });
  }

  let cuerpo = '';
  req.on('data', (c) => (cuerpo += c));
  req.on('end', () => {
    try {
      const d = JSON.parse(cuerpo);
      const valido =
        Number.isInteger(d.id_unidad) &&
        typeof d.latitud === 'number' &&
        typeof d.longitud === 'number' &&
        typeof d.velocidad === 'number' &&
        typeof d.estado === 'string';
      if (!valido) {
        console.log('400 - payload inválido:', cuerpo);
        return json(400, { error: 'Payload inválido' });
      }
      ultimas.set(d.id_unidad, d);
      console.log(`201 - U${d.id_unidad} (${d.latitud}, ${d.longitud}) ${d.velocidad} km/h ${d.estado}`);
      json(201, { ok: true });
    } catch {
      json(400, { error: 'JSON inválido' });
    }
  });
});

servidor.listen(PUERTO, () => {
  console.log(`Mock del backend escuchando en http://localhost:${PUERTO}${RUTA}`);
});
