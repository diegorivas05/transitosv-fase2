import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { mockUsuarios, mockRutas, mockUnidades } from "../data/mockData";

const router = Router();

// --- AUTENTICACIÓN ---
router.post("/auth/registro", async (req: Request, res: Response) => {
  const { nombre, correo, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const nuevoUsuario = {
    id_usuario: mockUsuarios.length + 1,
    nombre,
    correo,
    passwordHash: hashedPassword,
    rol: "pasajero"
  };
  
  mockUsuarios.push(nuevoUsuario);
  res.status(201).json({ mensaje: "Usuario registrado con éxito", usuarioId: nuevoUsuario.id_usuario });
});

router.post("/auth/login", async (req: Request, res: Response) => {
  const { correo, password } = req.body;
  const usuario = mockUsuarios.find(u => u.correo === correo);

  if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  const token = jwt.sign(
    { id_usuario: usuario.id_usuario, correo: usuario.correo, rol: usuario.rol },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "8h" }
  );

  res.json({ token, usuario: { nombre: usuario.nombre, correo: usuario.correo } });
});

// --- RUTAS Y UNIDADES ---
router.get("/rutas", (req: Request, res: Response) => {
  res.json(mockRutas);
});

router.get("/unidades", (req: Request, res: Response) => {
  res.json(mockUnidades);
});

// --- TELEMETRÍA IOT ---
router.post("/unidades/telemetria", (req: Request, res: Response) => {
  const { id_unidad, latitud, longitud, velocidad } = req.body;
  
  const unidad = mockUnidades.find(u => u.id_unidad === id_unidad);
  if (unidad) {
    unidad.latitud = latitud;
    unidad.longitud = longitud;
    unidad.velocidad = velocidad;
  }

  res.json({ status: "OK", recibido: { id_unidad, latitud, longitud, velocidad } });
});

// --- PREDICCIONES IA ---
router.get("/predicciones/:id_ruta", (req: Request, res: Response) => {
  const { id_ruta } = req.params;
  
  res.json({
    id_ruta: Number(id_ruta),
    tiempo_estimado_minutos: 15,
    confianza_modelo: "89%",
    mensaje: "Tiempo predicho basado en tráfico histórico"
  });
});

export default router;
