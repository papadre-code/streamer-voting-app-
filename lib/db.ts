const DB_ENDPOINT = process.env.DOCUMENT_API_ENDPOINT || "";
const DB_REGION = process.env.DOCUMENT_API_REGION || "ru-central1";

export async function isDatabaseAvailable(): Promise<boolean> {
  if (process.env.USE_DATABASE === "false") return false;
  if (!DB_ENDPOINT) return false;
  return true;
}

export async function ydbRequest(action: string, body: any): Promise<any> {
  const response = await fetch(DB_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Amz-Target": `DynamoDB_20120810.${action}`,
      "X-Amz-Date": new Date().toISOString().replace(/[:-]/g, "").split(".")[0] + "Z",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`YDB error: ${text}`);
  }
  return response.json();
}
