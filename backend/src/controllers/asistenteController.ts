import { Request, Response } from 'express';
import * as db from '../config/db';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const chatAsistente = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { mensaje } = req.body;

    if (!mensaje) {
      return res.status(400).json({ error: 'El mensaje es requerido.' });
    }

    // 1. Obtener unidades de transporte unidas con sus rutas desde MySQL
    let unidades: any = [];
    try {
      const queryFn = (db as any).query || (db as any).default?.query;
      if (queryFn) {
        const sqlQuery = `
          SELECT 
            u.id_unidad,
            r.nombre AS ruta,
            u.coordenadas,
            u.velocidad,
            u.estado,
            r.lista_paradas
          FROM unidades_transporte u
          INNER JOIN rutas r ON u.id_ruta = r.id_ruta
        `;
        const result = await queryFn(sqlQuery);
        // Manejo compatible de resultados de mysql2 (arrays de filas o [rows, fields])
        unidades = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : (Array.isArray(result) ? result : []);
      }
      console.log(`[BD DEBUG] Unidades cargadas correctamente: ${unidades.length}`);
    } catch (dbError) {
      console.error('[BD ERROR] Error al consultar la base de datos:', dbError);
    }

    const contextoFlota = JSON.stringify(unidades, null, 2);

    // 2. Definición del Prompt para Gemini
    const systemPrompt = `
      Eres el Asistente IA Oficial de TránsitoSV en El Salvador.
      
      DATOS EN VIVO DE LA FLOTA (unidades_transporte + rutas):
      ${contextoFlota}

      REGLAS DE COMPORTAMIENTO:
      - Responde siempre en español de forma amigable, fluida y concisa.
      - Si te saludan, responde cordialmente indicando cuántas unidades hay monitoreadas en vivo y en qué puedes ayudar.
      - Si preguntan por rutas específicas (ej. Ruta 101-D, Ruta 44, Ruta 30, Ruta 52, Ruta 42-B, Ruta 29-A), menciona sus paradas clave, velocidad actual de sus unidades y estado.
      - Si preguntan por velocidades o excesos, revisa las velocidades de las unidades y detalla sus datos.
      - Evita repetir la palabra "Comprendido".
    `;

    // 3. Petición HTTP directa a la API de Gemini
    const apiKey = process.env.GEMINI_API_KEY || '';
    const modelos = ['gemini-3.8-flash', 'gemini-1.5-flash'];
    let respuestaTexto = '';

    for (const modelo of modelos) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;
      const payload = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: mensaje }] }]
      };

      try {
        let intentos = 0;
        let apiResponse: any = null;
        let data: any = null;

        while (intentos < 2) {
          intentos++;
          apiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          data = await apiResponse.json();

          if (apiResponse.ok) {
            respuestaTexto = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            break;
          }

          if (apiResponse.status === 503) {
            await delay(1500);
          } else {
            break;
          }
        }

        if (respuestaTexto) break;
      } catch (e) {
        console.warn(`Error al intentar con el modelo ${modelo}`);
      }
    }

    if (!respuestaTexto) {
      respuestaTexto = `Actualmente tenemos ${unidades.length} unidades de transporte monitoreadas en tiempo real en la flota.`;
    }

    return res.json({ respuesta: respuestaTexto });

  } catch (error: any) {
    console.error('Error en asistenteController:', error?.message || error);
    return res.status(500).json({
      respuesta: 'Ocurrió un inconveniente al consultar los datos telemáticos en vivo.'
    });
  }
};