import { test } from "node:test";
import assert from "node:assert/strict";
import { ContactDelivery } from "../dist/contact-state.js";
test("pending submission survives view changes and rejects duplicate sends", async () => {
  let resolve,
    calls = 0;
  const events = [],
    timers = [];
  const flow = new ContactDelivery(
    () => {
      calls++;
      return new Promise((r) => (resolve = r));
    },
    (fn) => {
      timers.push(fn);
      return 1;
    },
    () => {},
  );
  flow.onChange = (event) => events.push(event);
  const first = flow.send("https://example.com", {
    email: "sender@example.com",
    Mensaje: "Hola",
  });
  assert.equal(flow.send("https://example.com", { Mensaje: "Otro" }), first);
  await Promise.resolve();
  assert.equal(calls, 1);
  assert.equal(flow.state.status, "pending");
  assert.equal(flow.state.values.Mensaje, "Hola");
  timers[0]();
  assert.equal(flow.state.slow, true);
  resolve({ success: true });
  await first;
  assert.equal(flow.state.status, "sent");
  assert.deepEqual(flow.state.values, {});
  assert.deepEqual(events, ["pending", "slow", "sent"]);
});
test("a failed background delivery retains the complete draft and allows retry", async () => {
  let calls = 0;
  const draft = {
    email: "sender@example.com",
    Motivo: "Trabajo",
    Mensaje: "Hola",
    Teléfono: "123",
  };
  const flow = new ContactDelivery(
    async () => {
      calls++;
      if (calls === 1) throw Error("Network");
      return { success: true };
    },
    () => 1,
    () => {},
  );
  await assert.rejects(flow.send("https://example.com", draft));
  assert.equal(flow.state.status, "error");
  assert.deepEqual(flow.state.values, draft);
  assert.equal(flow.operation, null);
  await flow.send("https://example.com", flow.state.values);
  assert.equal(calls, 2);
  assert.equal(flow.state.status, "sent");
});
test("fast deliveries cancel the slow notice and are not labelled delayed", async () => {
  let cancelled = false;
  const events = [];
  const flow = new ContactDelivery(
    async () => ({ success: true }),
    () => 3,
    (id) => {
      assert.equal(id, 3);
      cancelled = true;
    },
  );
  flow.onChange = (event) => events.push(event);
  await flow.send("https://example.com", {});
  assert.equal(cancelled, true);
  assert.equal(flow.state.slow, false);
  assert.deepEqual(events, ["pending", "sent"]);
});

test("browser timer functions are called without the delivery object as receiver", async () => {
  const flow = new ContactDelivery(
    async () => ({ success: true }),
    function () {
      assert.equal(this, undefined);
      return 7;
    },
    function (id) {
      assert.equal(this, undefined);
      assert.equal(id, 7);
    },
  );
  await flow.send("https://example.com", {});
  assert.equal(flow.state.status, "sent");
});
