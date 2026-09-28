import { Request, Response } from "express";
import { pool } from "../config/db";

export const obtenerRutas = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rutas]: any = await pool?.query("SELECT * FROM rutas");
    res.json(rutas);
  } catch (error) {
    console.error("Error al obtener rutas:", error);
    res.status(500).json({ mensaje: "Error al consultar la base de datos" });
  }
};