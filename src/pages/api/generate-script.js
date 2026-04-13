import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST({ request }) {
  // Validar método
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Obtener API key desde variables de entorno
    const apiKey = import.meta.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error('GOOGLE_API_KEY no configurada');
      return new Response(JSON.stringify({ error: 'Configuración del servidor incompleta' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parsear el body
    const data = await request.json();
    
    const {
      name,
      posiciones,
      momentoImparable,
      estadoEmocional,
      accionFortalecer,
      reaccionActual,
      reaccionIdeal,
      fraseActivacion
    } = data;

    // Validar datos
    if (!name || !posiciones || !momentoImparable || !estadoEmocional || 
        !accionFortalecer || !reaccionActual || !reaccionIdeal) {
      return new Response(JSON.stringify({ error: 'Datos incompletos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Inicializar Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Crear prompt
    const prompt = `Actúa como un psicólogo deportivo experto. Escribe un guion de visualización en primera persona para el futbolista ${name}. 
    Datos clave: Posición ${posiciones}, Momento de éxito: ${momentoImparable}, Estado deseado: ${estadoEmocional}, Acción a mejorar: ${accionFortalecer}, Reacción ideal al error: ${reaccionIdeal}. 
    Usa esta frase de activación: ${fraseActivacion || 'Crea una de 3 palabras'}.
    
    Estructura el guion exactamente en estos 7 bloques:
    [BLOQUE 1 — RELAJACIÓN]
    [BLOQUE 2 — ESCENA ANCLA DE CONFIANZA]
    [BLOQUE 3 — VISUALIZACIÓN DEL PARTIDO]
    [BLOQUE 4 — ESTADO EMOCIONAL DESEADO]
    [BLOQUE 5 — REACCIÓN AL ERROR]
    [BLOQUE 6 — SITUACIÓN DE PRESIÓN ESPECÍFICA]
    [BLOQUE 7 — CIERRE Y ACTIVACIÓN]
    
    Reglas: Tono directo y profesional, tiempo presente, aproximadamente 1000 palabras en total. Devuelve SOLO el guion.`;

    // Generar guion
    const result = await model.generateContent(prompt);
    const script = result.response.text();

    // Retornar respuesta
    return new Response(JSON.stringify({ script }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al generar guion:', error);
    return new Response(JSON.stringify({ 
      error: 'Error al generar el guion',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
