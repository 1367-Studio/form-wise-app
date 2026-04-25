import { Resend } from "resend";

let instance: Resend | undefined;

function getInstance(): Resend {
  if (!instance) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY is not set");
    }
    instance = new Resend(key);
  }
  return instance;
}

export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    return Reflect.get(getInstance(), prop);
  },
});
