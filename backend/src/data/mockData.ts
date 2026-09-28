export interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  passwordHash: string;
  rol: string;
}

export interface Ruta {
  id_ruta: number;
  nombre: string;
  recorrido: string[];
}

export interface Unidad {
  id_unidad: number;
  id_ruta: number;
  placa: string;
  latitud: number;
  longitud: number;
  velocidad: number;
}

export const mockUsuarios: Usuario[] = [];

export const mockRutas: Ruta[] = [
  { id_ruta: 1, nombre: "Ruta 30-B", recorrido: ["UDB", "Metrocentro", "Centro Histórico"] },
  { id_ruta: 2, nombre: "Ruta 44", recorrido: ["Antiguo Cuscatlán", "UCA", "Metrocentro"] }
];

export const mockUnidades: Unidad[] = [
  { id_unidad: 101, id_ruta: 1, placa: "MB-1234", latitud: 13.7142, longitud: -89.1558, velocidad: 35.5 }
];
