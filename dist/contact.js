export class ContactError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ContactError";
    this.code = code;
  }
}
export async function submitContact(action, values, fetcher = fetch) {
  const url = new URL(action);
  if (!url.pathname.startsWith("/ajax/")) url.pathname = `/ajax${url.pathname}`;
  const payload = { ...values };
  delete payload._next;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);
  try {
    // El formato de formulario evita una petición CORS previa innecesaria.
    const response = await fetcher(url.href, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new URLSearchParams(payload),
      signal: controller.signal,
    });
    let result;
    try {
      result = await response.json();
    } catch {
      throw new ContactError(
        "response",
        "El servicio respondió de forma inesperada. Tus datos siguen aquí.",
      );
    }
    if (
      !response.ok ||
      (result.success !== true && result.success !== "true")
    ) {
      const message = String(result.message || "").toLowerCase();
      if (message.includes("activat"))
        throw new ContactError(
          "activation",
          "FormSubmit pide activar este formulario. Revisa el correo de activación.",
        );
      throw new ContactError(
        "rejected",
        "El servicio no aceptó el envío. Tus datos siguen aquí; inténtalo más tarde.",
      );
    }
    return result;
  } catch (error) {
    if (error instanceof ContactError) throw error;
    if (controller.signal.aborted)
      throw new ContactError(
        "timeout",
        "El servicio está tardando demasiado. No pudimos confirmar el envío; revisa tu correo antes de reintentar.",
      );
    throw new ContactError(
      "network",
      "No se pudo conectar con el servicio de correo. Tus datos siguen aquí; revisa tu conexión e inténtalo más tarde.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
