
import { Request, Response } from 'express';
import { pool } from '../config/db';

export const obtenerUnidades = async (req: Request, res: Response): Promise<void> => {
  try {
    const [unidades]: any = await pool?.query(
      'SELECT u.*, r.nombre AS nombre_ruta FROM unidades_transporte u JOIN rutas r ON u.id_ruta = r.id_ruta'
    );
    res.json(unidades);
  } catch (error) {
    console.error('Error al obtener unidades:', error);
    res.status(500).json({ mensaje: 'Error al consultar la base de datos' });
  }
};

export const registrarTelemetria = async (req: Request, res: Response): Promise<void> => {
  const { id_unidad, coordenadas, velocidad } = req.body;

  if (!id_unidad || !coordenadas) {
    res.status(400).json({ mensaje: 'id_unidad y coordenadas son requeridos' });
    return;
  }

  try {
    await pool?.query(
      'INSERT INTO telemetria (fecha_hora, coordenadas, velocidad, id_unidad) VALUES (NOW(), ?, ?, ?)',
      [coordenadas, velocidad || 0.0, id_unidad]
    );

    await pool?.query(
      'UPDATE unidades_transporte SET coordenadas = ?, velocidad = ? WHERE id_unidad = ?',
      [coordenadas, velocidad || 0.0, id_unidad]
    );

    res.status(201).json({ mensaje: 'Telemetría registrada correctamente' });
  } catch (error) {
    console.error('Error al registrar telemetría:', error);
    res.status(500).json({ mensaje: 'Error al guardar telemetría' });
  }
};