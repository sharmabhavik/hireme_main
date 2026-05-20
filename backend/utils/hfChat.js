const HF_BASE_URL = "https://router.huggingface.co/v1";

export class HfError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = "HfError";
    this.status = status;
    this.body = body;
  }
}

export async function hfChatCompletions({
  model,
  messages,
  temperature = 0.5,
  max_tokens = 500,
}) {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new HfError("HF_TOKEN is missing", { status: 500 });
  }

  const resolvedModel = model || process.env.HF_MODEL;
  if (!resolvedModel) {
    throw new HfError("HF_MODEL is missing", { status: 500 });
  }

  const resp = await fetch(`${HF_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: resolvedModel,
      messages,
      temperature,
      max_tokens,
    }),
  });

  const text = await resp.text();
  if (!resp.ok) {
    throw new HfError(`HF error ${resp.status}`, {
      status: resp.status,
      body: text,
    });
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new HfError("HF returned non-JSON", {
      status: resp.status,
      body: text,
    });
  }

  const content = json?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new HfError("HF returned empty content", {
      status: resp.status,
      body: json,
    });
  }

  return content;
}
