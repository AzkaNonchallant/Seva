/** Shape every server action returns, so the client can render one toast path. */
export type ActionResult<T> =
  | { ok: true; data: T; message?: string }
  | { ok: false; message: string; fields?: Record<string, string> };
