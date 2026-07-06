/**
 * LLM Client (Vanilla JS)
 * Handles OpenAI-compatible API calls for text transformation.
 */

export class LLMClient {
  constructor() {
    this.apiUrl = "https://api.openai.com/v1/chat/completions";
    this.model = "gpt-4o-mini";
  }

  /**
   * Retrieves the API key securely from LocalStorage
   */
  getApiKey() {
    return localStorage.getItem("llm_api_key") || "";
  }

  /**
   * Sets the API key in LocalStorage
   */
  setApiKey(key) {
    localStorage.setItem("llm_api_key", key.trim());
  }

  /**
   * Rewrites text based on a given action mode
   * @param {string} text The text to rewrite
   * @param {string} mode 'formal', 'concise', or 'structure'
   * @returns {Promise<string>} The rewritten text
   */
  async rewriteText(text, mode) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error(
        "Kein API Key gefunden. Bitte in der Dev-Sidebar eintragen.",
      );
    }

    let systemPrompt =
      "Du bist ein Assistent für Geschäftsbriefe. Antworte NUR mit dem reinen überarbeiteten Text. Keine Erklärungen, kein Markdown, keine Anführungszeichen am Anfang/Ende. ";

    if (mode === "formal") {
      systemPrompt +=
        "Formuliere den folgenden Text sehr förmlich, höflich und professionell im DIN-Brief Stil.";
    } else if (mode === "concise") {
      systemPrompt +=
        "Entferne alle Füllwörter und unnötige Phrasen. Mache den Text extrem präzise und direkt auf den Punkt.";
    } else if (mode === "structure") {
      systemPrompt +=
        "Strukturiere den unordentlichen Text so, dass er einen perfekten 'Roten Faden' hat. Bringe Argumente in eine logische Reihenfolge, ohne den inhaltlichen Sinn zu verfälschen.";
    } else {
      systemPrompt += "Überarbeite den Text leicht für bessere Lesbarkeit.";
    }

    const payload = {
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.3,
    };

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Fehler (${response.status}): ${errText}`);
    }

    const data = await response.json();
    let resultText = data.choices[0].message.content.trim();

    // Safety fallback to remove potential leftover markdown or quotes
    if (resultText.startsWith('"') && resultText.endsWith('"')) {
      resultText = resultText.substring(1, resultText.length - 1);
    }

    return resultText;
  }
}
