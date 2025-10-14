
const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Método no permitido" };
    }

    const data = JSON.parse(event.body);

    // Determinar workflow según script
    let workflow_id;
    if (data.script === "Parte_horas_v9") {
      workflow_id = "Parte_horas_v9.yml"; // nombre exacto del YML en repo privado
    } else if (data.script === "AGAPA_SEG") {
      workflow_id = "AGAPA_SEG.yml";
    } else {
      return { statusCode: 400, body: "Script desconocido" };
    }

    // Token secreto de Netlify
    const token = process.env.PRIV_TOKEN;
    if (!token) return { statusCode: 500, body: "No se encontró token de GitHub en Netlify" };

    // URL para dispatch del workflow
    const url = `https://api.github.com/repos/TU_ORG/TU_REPO_PRIVATE/actions/workflows/${workflow_id}/dispatches`;

    // Mapear variables del payload al ref y inputs del workflow
    const bodyPayload = {
      ref: "main", // rama donde está el YML
      inputs: data // todos los campos del JSON se pasan como inputs
    };

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
    return { statusCode: 500, body: "Error al activar workflow: " + err.message };
  }
};
