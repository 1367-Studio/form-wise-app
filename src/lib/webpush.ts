import webpush from "web-push";
import { prisma } from "./prisma";

let configured = false;

function configure() {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    return false;
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  /** Click target inside the app (e.g. "/fr/dashboard/parent"). */
  url?: string;
  /** Coalescence key — newer notifs with the same tag replace old ones. */
  tag?: string;
  /** Arbitrary data the SW will merge into notification.data. */
  data?: Record<string, unknown>;
}

/**
 * Best-effort: pushes are not transactional. Failures are logged but do not
 * propagate. Subscriptions returning 404/410 are pruned automatically.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  if (!configure()) {
    console.warn("VAPID keys not configured; skipping push");
    return { sent: 0, failed: 0 };
  }

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return { sent: 0, failed: 0 };

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    tag: payload.tag,
    data: { ...(payload.data ?? {}), url: payload.url ?? "/" },
  });

  let sent = 0;
  let failed = 0;
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body
        );
        sent++;
      } catch (err: unknown) {
        failed++;
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          // Subscription is dead — prune it so we don't keep retrying.
          await prisma.pushSubscription
            .delete({ where: { id: sub.id } })
            .catch(() => {});
        } else {
          console.error("web-push error", status, (err as Error).message);
        }
      }
    })
  );

  return { sent, failed };
}
