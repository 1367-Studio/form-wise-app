"use client";

/**
 * Last-resort boundary: catches anything that escapes the locale layout, which
 * means it has to render its own <html>/<body> and cannot rely on next-intl.
 *
 * The <title> and the noindex are the point. Without them Next serves its bare
 * error shell with an empty <title>, and if a crawler catches the site mid-crash
 * that page gets indexed as "Untitled" — which is exactly what happened to the
 * homepage in July 2026 and stayed in Google's results for weeks afterwards.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <head>
        <title>Erreur — Formwise</title>
        <meta name="robots" content="noindex" />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#ffffff",
          color: "#0f172a",
        }}
      >
        <main style={{ maxWidth: 480, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
            Une erreur est survenue
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "#475569" }}>
            Nous ne parvenons pas à afficher cette page pour le moment. Merci de
            réessayer dans un instant.
          </p>
          {error.digest && (
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 16 }}>
              Référence : {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "10px 20px",
              fontSize: 15,
              color: "#ffffff",
              background: "#003EA3",
              border: 0,
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
