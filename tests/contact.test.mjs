import { test } from "node:test";
import assert from "node:assert/strict";
import { submitContact, ContactError } from "../dist/contact.js";
const action = "https://formsubmit.co/receiver@example.com";
test("submission requires explicit service confirmation and sends the expected fields", async () => {
  let request;
  await submitContact(
    action,
    {
      email: "sender@example.com",
      Motivo: "Prueba",
      Mensaje: "Texto",
      _next: "https://example.com",
    },
    async (url, options) => {
      request = { url, options };
      return { ok: true, json: async () => ({ success: "true" }) };
    },
  );
  assert.equal(request.url, "https://formsubmit.co/ajax/receiver@example.com");
  const body = Object.fromEntries(request.options.body);
  assert.equal(body.Mensaje, "Texto");
  assert.equal(body.email, "sender@example.com");
  assert.equal(body._next, undefined);
});
test("rejected and malformed responses cannot be shown as sent", async () => {
  for (const result of [
    { success: false },
    { success: "false" },
    { message: "Activation required" },
    {},
  ])
    await assert.rejects(
      submitContact(action, {}, async () => ({
        ok: true,
        json: async () => result,
      })),
    );
  await assert.rejects(
    submitContact(action, {}, async () => ({
      ok: false,
      json: async () => ({ success: true }),
    })),
  );
});
test("network errors are reported instead of claiming delivery", async () => {
  await assert.rejects(
    submitContact(action, {}, async () => {
      throw new TypeError("Network error");
    }),
  );
});

test("activation failures are reported without clearing the visitor data", async () => {
  await assert.rejects(
    submitContact(action, {}, async () => ({
      ok: true,
      json: async () => ({
        success: false,
        message: "This form needs Activation",
      }),
    })),
    (error) => error instanceof ContactError && error.code === "activation",
  );
});
test("form encoding avoids a CORS preflight and an alias is not duplicated", async () => {
  await submitContact(
    "https://formsubmit.co/ajax/test-alias",
    { email: "sender@example.com" },
    async (url, options) => {
      assert.equal(url, "https://formsubmit.co/ajax/test-alias");
      assert.ok(options.body instanceof URLSearchParams);
      assert.equal(options.headers["Content-Type"], undefined);
      return { ok: true, json: async () => ({ success: true }) };
    },
  );
});
