
exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Método no permitido" };
    }

    const data = JSON.parse(event.body);

    // Determinar workflow según script
    let workflow_id;
    if (data.script === "Parte_horas_v9") {
      workflow_id = "Parte_horas_v9.yml"; // nombre exacto del YML en el repo privado
    } else if (data.script === "AGAPA_SEG") {
      workflow_id = "AGAPA_SEG.yml";
    } else {
      return { statusCode: 400, body: "Script desconocido" };
    }

    // Token secreto de Netlify (variable de entorno PRIV_TOKEN)
    const token = process.env.PRIV_TOKEN;
    if (!token) {
      return { statusCode: 500, body: "No se encontró token de GitHub en Netlify" };
    }

    // Corrige esta línea: aquí va el usuario/organización y el nombre del repo privado
    const url = `https://api.github.com/repos/agapattec/AGAPA_auto/actions/workflows/${workflow_id}/dispatches`;

    // Cuerpo de la petición
    const bodyPayload = {
      ref: "main", // Rama donde está el YML
      inputs: data  // Se pasan todos los campos del formulario como inputs del workflow
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
