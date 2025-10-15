
exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Método no permitido" };
    }

    const data = JSON.parse(event.body);

    // Determinar workflow según script
    let workflow_id;
    let inputs= {};
    
    if (data.script === "Parte_horas_v9") {
      workflow_id = "Parte_horas_v9.yml"; // workflow de Fichajes
      inputs = {
        ano: data.ano,
        mes: data.mes,
        fase: data.fase
      };
    } else if (data.script === "AGAPA_SEG") {
      workflow_id = "AGAPA_SEG.yml"; // workflow de SEG
      inputs = {
        ano: data.Anio,
        mes: data.Mes,
        periodo: data.Periodo,
        certi: data.Certi
      };
    } else {
      return { statusCode: 400, body: "Script desconocido" };
    }

    // Token secreto de Netlify (variable de entorno PRIV_TOKEN)
    const token = process.env.PRIV_TOKEN;
    if (!token) {
      return { statusCode: 500, body: "No se encontró token de GitHub en Netlify" };
    }

    const url = `https://api.github.com/repos/agapattec/AGAPA_auto/actions/workflows/${workflow_id}/dispatches`;

    // Payload
    const bodyPayload = {
      ref: "main",
      inputs: inputs
    };

    console.log("---- INICIO DISPATCH ----");
    console.log("URL:", url);
    console.log("Token presente:", !!token);
    console.log("Payload:", JSON.stringify(bodyPayload, null, 2));
    console.log("--------------------------");

    // Usamos fetch nativo (sin node-fetch)
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyPayload)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    return { statusCode: 200, body: "Workflow activado correctamente." };
  
  } catch (err) {
    console.error("Error detallado:", err);
    return { 
      statusCode: 500, 
      body: "Error al activar workflow: " + (err.message || JSON.stringify(err)) 
    };
  }
};
