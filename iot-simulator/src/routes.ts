export interface Punto {
  nombre: string;
  lat: number;
  lng: number;
}



export interface RutaSim {
  nombre: string;
  puntos: Punto[];  
}




export const RUTAS: Record<number, RutaSim> = {
  1: {
    nombre: 'Ruta 101-D',
    puntos: [
      { nombre: 'Santa Tecla', lat: 13.6763, lng: -89.2797 },
      { nombre: 'Parque Daniel Hernández', lat: 13.6771, lng: -89.2795 },
      { nombre: 'Paseo General Escalón', lat: 13.6995, lng: -89.2385 },
      { nombre: 'Redondel Masferrer', lat: 13.7008, lng: -89.2367 },
      { nombre: 'Metrocentro', lat: 13.7047, lng: -89.2116 },
      { nombre: 'Parque Infantil', lat: 13.7049, lng: -89.2019 },
      { nombre: 'Centro Histórico', lat: 13.6989, lng: -89.1914 },
      { nombre: '4ª Calle Poniente', lat: 13.6985, lng: -89.1945 },
    ],
  },
  2: {
    nombre: 'Ruta 44',
    puntos: [
      { nombre: 'Antiguo Cuscatlán', lat: 13.6733, lng: -89.2496 },
      { nombre: 'Multiplaza', lat: 13.6786, lng: -89.2503 },
      { nombre: 'Redondel Luceiro', lat: 13.6875, lng: -89.2350 },
      { nombre: 'UES', lat: 13.7173, lng: -89.2006 },
      { nombre: 'Redondel Schafik Hándal', lat: 13.7100, lng: -89.2050 },
      { nombre: 'Metrocentro', lat: 13.7047, lng: -89.2116 },
      { nombre: 'Mercado Central', lat: 13.6990, lng: -89.1890 },
    ],
  },
  3: {
    nombre: 'Ruta 30',
    puntos: [
      { nombre: 'UES', lat: 13.7173, lng: -89.2006 },
      { nombre: 'Plaza de la Salud', lat: 13.7120, lng: -89.2017 },
      { nombre: 'Maternidad', lat: 13.7030, lng: -89.2000 },
      { nombre: 'Metrocentro', lat: 13.7047, lng: -89.2116 },
      { nombre: 'San Jacinto', lat: 13.6787, lng: -89.1870 },
    ],
  },
  4: {
    nombre: 'Ruta 52 (Escalón)',
    puntos: [
      { nombre: 'Colonia Escalón', lat: 13.7050, lng: -89.2400 },
      { nombre: 'Paseo General Escalón', lat: 13.6995, lng: -89.2385 },
      { nombre: 'Redondel Altagracia', lat: 13.7010, lng: -89.2190 },
      { nombre: 'Centro de San Salvador', lat: 13.6989, lng: -89.1914 },
      { nombre: 'Plaza Mundo', lat: 13.7132, lng: -89.1373 },
    ],
  },
  5: {
    nombre: 'Ruta 42-B',
    puntos: [
      { nombre: 'Santa Tecla', lat: 13.6763, lng: -89.2797 },
      { nombre: 'Merliot', lat: 13.6774, lng: -89.2560 },
      { nombre: 'Carretera Panamericana', lat: 13.6800, lng: -89.2300 },
      { nombre: 'Salvador del Mundo', lat: 13.7010, lng: -89.2247 },
      { nombre: 'Centro de San Salvador', lat: 13.6989, lng: -89.1914 },
    ],
  },
  6: {
    nombre: 'Ruta 29-A',
    puntos: [
      { nombre: 'Soyapango', lat: 13.7100, lng: -89.1500 },
      { nombre: 'Plaza Mundo', lat: 13.7132, lng: -89.1373 },
      { nombre: 'Boulevard del Ejército', lat: 13.7050, lng: -89.1600 },
      { nombre: 'Terminal de Buses del Sur', lat: 13.6900, lng: -89.1800 },
      { nombre: 'Centro Histórico', lat: 13.6989, lng: -89.1914 },
    ],
  },
};

 


export const UNIDADES: { id_unidad: number; id_ruta: number }[] = [
  { id_unidad: 1, id_ruta: 1 },
  { id_unidad: 2, id_ruta: 2 },
  { id_unidad: 3, id_ruta: 1 },
  { id_unidad: 4, id_ruta: 1 },
  { id_unidad: 5, id_ruta: 1 },
  { id_unidad: 6, id_ruta: 2 },
  { id_unidad: 7, id_ruta: 2 },
  { id_unidad: 8, id_ruta: 3 },
  { id_unidad: 9, id_ruta: 3 },
  { id_unidad: 10, id_ruta: 4 },
  { id_unidad: 11, id_ruta: 5 },
  { id_unidad: 12, id_ruta: 5 },
  { id_unidad: 13, id_ruta: 6 },
];
