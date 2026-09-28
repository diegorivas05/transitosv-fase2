import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const useMock = process.env.USE_MOCK_DB === "true";

export const pool = !useMock
  ? mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "transitosv",
      port: Number(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  : null;

export const checkDatabaseConnection = async () => {
  if (useMock) {
    console.log("ℹ️ Modo MOCK activo: Usando datos simulados.");
    return;
  }

  try {
    const connection = await pool?.getConnection();
    console.log("🟢 Conexion exitosa a la Base de Datos MySQL (transitosv).");
    connection?.release();
  } catch (error) {
    console.error("🔴 Error al conectar con MySQL:", error);
  }
};