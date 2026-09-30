import { RUTAS, UNIDADES, type Punto } from './routes.js';
import { config } from './config.js';



export type Estado = 'activo' | 'en parada' | 'inactivo';


 export interface Telemetria {
  id_unidad: number;
  coordenadas: string;
  latitud: number;
  longitud: number;
  velocidad: number; 
  estado: Estado;
  timestamp: string;
}

const RADIO_TIERRA_KM = 6371;
const aRad = (g: number) => (g * Math.PI) / 180;


function distanciaKm(a: Punto, b: Punto): number {
  const dLat = aRad(b.lat - a.lat);
  const dLng = aRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRad(a.lat)) * Math.cos(aRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(h));
}

const entre = (min: number, max: number) => min + Math.random() * (max - min);
const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const redondear = (v: number, dec: number) => Number(v.toFixed(dec));



class Unidad {
  private readonly puntos: Punto[];
  private readonly acumulado: number[];  
  private readonly total: number;
  private dist: number; 
  private dir: 1 | -1;
  private velocidad = 0;
  private pausa = 0;  
  private estado: Estado = 'activo';
  private readonly inactiva: boolean;

  constructor(
    readonly id: number,
    readonly idRuta: number,
    indice: number,
    cantidad: number,
  ) {
    this.puntos = RUTAS[idRuta].puntos;
    this.acumulado = [0];
    for (let i = 1; i < this.puntos.length; i++) {
      this.acumulado.push(this.acumulado[i - 1] + distanciaKm(this.puntos[i - 1], this.puntos[i]));
    }
    this.total = this.acumulado[this.acumulado.length - 1];
    
    
    this.dist = ((indice + 0.5) / cantidad) * this.total;
    this.dir = indice % 2 === 0 ? 1 : -1;
    this.inactiva = config.inactiveUnits.includes(id);
    this.estado = this.inactiva ? 'inactivo' : 'activo';
    this.velocidad = this.inactiva ? 0 : entre(20, 35);
  }

 

  avanzar(dtSeg: number): void {
    if (this.inactiva) return;

    if (this.pausa > 0) {
      this.pausa--;
      this.velocidad = 0;
      this.estado = 'en parada';
      return;
    }

    
    
    this.velocidad = limitar(this.velocidad + entre(-5, 5), 12, 45);
    this.estado = 'activo';

    const avance = this.velocidad * (dtSeg / 3600) * config.timeScale;
    const nueva = this.dist + this.dir * avance;

  
    
    let paradaIdx = -1;
    let menorDist = Infinity;
    this.acumulado.forEach((w, i) => {
      const cruzo = (this.dist - w) * (nueva - w) < 0 || nueva === w;
      if (cruzo && Math.abs(w - this.dist) < menorDist) {
        menorDist = Math.abs(w - this.dist);
        paradaIdx = i;
      }
    });

    if (paradaIdx >= 0) {
      this.dist = this.acumulado[paradaIdx];
      this.velocidad = 0;
      this.estado = 'en parada';
      this.pausa = Math.floor(entre(2, 5));
      if (paradaIdx === 0) this.dir = 1;  
      if (paradaIdx === this.puntos.length - 1) this.dir = -1;  
      return;
    }
    this.dist = limitar(nueva, 0, this.total);
  }

  private posicion(): { lat: number; lng: number } {
    let i = 0;
    while (i < this.acumulado.length - 2 && this.dist > this.acumulado[i + 1]) i++;
    const tramo = this.acumulado[i + 1] - this.acumulado[i] || 1;
    const t = limitar((this.dist - this.acumulado[i]) / tramo, 0, 1);
    const a = this.puntos[i];
    const b = this.puntos[i + 1];
    return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
  }
  

   lectura(): Telemetria {
    const p = this.posicion();
    const ruido = () => (Math.random() - 0.5) * 0.00006;  
    const latitud = redondear(p.lat + ruido(), 6);
    const longitud = redondear(p.lng + ruido(), 6);
    return {
      id_unidad: this.id,
      coordenadas: `${latitud.toFixed(6)}, ${longitud.toFixed(6)}`,
      latitud,
      longitud,
      velocidad: redondear(this.velocidad, 2),
      estado: this.estado,
      timestamp: new Date().toISOString(),
    };
  }
}



export function crearFlota(): Unidad[] {
  const porRuta = new Map<number, number>();
  UNIDADES.forEach((u) => porRuta.set(u.id_ruta, (porRuta.get(u.id_ruta) ?? 0) + 1));
  const contador = new Map<number, number>();
  return UNIDADES.map((u) => {
    const idx = contador.get(u.id_ruta) ?? 0;
    contador.set(u.id_ruta, idx + 1);
    return new Unidad(u.id_unidad, u.id_ruta, idx, porRuta.get(u.id_ruta)!);
  });
}
