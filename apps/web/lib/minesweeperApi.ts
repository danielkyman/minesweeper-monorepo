import type { Game } from "@/types/minesweeper";

const BASE =
  process.env.NEXT_PUBLIC_MINESWEEPER_API_URL ?? "http://localhost:3001";

type JsonRequestInit<TBody = unknown> = Omit<RequestInit, "body"> & {
  body?: TBody;
};

async function request<TResponse, TBody = unknown>(
  path: string,
  { body, headers, ...rest }: JsonRequestInit<TBody> = {}
): Promise<TResponse> {
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body:
      body === undefined || body === null
        ? undefined
        : typeof body === "string"
          ? body
          : JSON.stringify(body),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} – ${await res.text()}`);
  }

  // 204 = No Content
  return res.status === 204
    ? (undefined as unknown as TResponse)
    : ((await res.json()) as TResponse);
}

// ────────────────────────────────────────────────────────────
// Exported, strongly-typed API helpers
// ────────────────────────────────────────────────────────────

export const createGame = (cfg: {
  rows: number;
  cols: number;
  mines: number;
}) =>
  request<Game, typeof cfg>("/game", {
    method: "POST",
    body: cfg,
  });

export const revealCell = (id: string, row: number, col: number) =>
  request<Game, { row: number; col: number }>(`/game/${id}/reveal`, {
    method: "PATCH",
    body: { row, col },
  });

export const flagCell = (id: string, row: number, col: number) =>
  request<Game, { row: number; col: number }>(`/game/${id}/flag`, {
    method: "PATCH",
    body: { row, col },
  });

export const getGame = (id: string) =>
  request<Game>(`/game/${id}`, { method: "GET" });

export const deleteGame = (id: string) =>
  request<void, never>(`/game/${id}`, { method: "DELETE" });
