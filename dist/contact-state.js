import { submitContact } from "./contact.js";

// Estado de un único envío; vive fuera de las secciones del portafolio.
export class ContactDelivery {
  constructor(
    send = submitContact,
    schedule = setTimeout,
    cancel = clearTimeout,
  ) {
    this.deliver = send;
    this.schedule = (callback, delay) => schedule(callback, delay);
    this.cancel = (timer) => cancel(timer);
    this.state = { status: "idle", values: {}, slow: false, error: null };
    this.operation = null;
    this.onChange = () => {};
  }
  send(action, values) {
    if (this.operation) return this.operation;
    this.state = {
      status: "pending",
      values: { ...values },
      slow: false,
      error: null,
    };
    this.onChange("pending", this.state);
    const slowTimer = this.schedule(() => {
      if (this.state.status !== "pending") return;
      this.state.slow = true;
      this.onChange("slow", this.state);
    }, 8000);
    this.operation = Promise.resolve()
      .then(() => this.deliver(action, { ...values }))
      .then(
        (result) => {
          this.state = {
            status: "sent",
            values: {},
            slow: this.state.slow,
            error: null,
          };
          this.onChange("sent", this.state);
          return result;
        },
        (error) => {
          this.state = { ...this.state, status: "error", error };
          this.onChange("error", this.state);
          throw error;
        },
      )
      .finally(() => {
        this.cancel(slowTimer);
        this.operation = null;
      });
    return this.operation;
  }
}
