import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";

import { POST } from "../app/api/generate/route";

const REQUEST_BODY = {
  brief: "Préparer trois variantes pour une journée portes ouvertes",
  persona: "Lycéens 16-20",
  platform: "Instagram Reel",
  visualStyle: "Documentaire",
  tone: "Direct & factuel",
  formation: "Design Graphique",
  duration: "30s",
};

const originalFetch = globalThis.fetch;
const originalRequestyKey = process.env.REQUESTY_API_KEY;
const originalConsoleError = console.error;

beforeEach(() => {
  process.env.REQUESTY_API_KEY = "test-key";
  console.error = () => {};
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalRequestyKey === undefined) {
    delete process.env.REQUESTY_API_KEY;
  } else {
    process.env.REQUESTY_API_KEY = originalRequestyKey;
  }
  console.error = originalConsoleError;
});

function createAbortableFetchMock() {
  let resolveSignal: (signal: AbortSignal) => void;
  const signalSeen = new Promise<AbortSignal>((resolve) => {
    resolveSignal = resolve;
  });

  const fetchMock = async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const signal = init?.signal;
    assert.ok(signal instanceof AbortSignal);
    resolveSignal(signal);

    return await new Promise<Response>((_resolve, reject) => {
      const rejectAbort = () => reject(new DOMException("Aborted", "AbortError"));
      if (signal.aborted) {
        rejectAbort();
        return;
      }
      signal.addEventListener("abort", rejectAbort, { once: true });
    });
  };

  return { fetchMock, signalSeen };
}

test("non-streaming generate aborts the outbound Requesty request", async () => {
  const { fetchMock, signalSeen } = createAbortableFetchMock();
  globalThis.fetch = fetchMock as typeof fetch;
  const controller = new AbortController();

  const responsePromise = POST(
    new Request("http://localhost/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(REQUEST_BODY),
      signal: controller.signal,
    }),
  );

  const outboundSignal = await signalSeen;
  assert.equal(outboundSignal.aborted, false);

  controller.abort();

  assert.equal(outboundSignal.aborted, true);
  const response = await responsePromise;
  assert.equal(response.status, 200);
});

test("streaming generate aborts the outbound Requesty request", async () => {
  const { fetchMock, signalSeen } = createAbortableFetchMock();
  globalThis.fetch = fetchMock as typeof fetch;
  const controller = new AbortController();

  const response = await POST(
    new Request("http://localhost/api/generate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "text/event-stream",
      },
      body: JSON.stringify(REQUEST_BODY),
      signal: controller.signal,
    }),
  );

  const outboundSignal = await signalSeen;
  assert.equal(outboundSignal.aborted, false);

  controller.abort();

  assert.equal(outboundSignal.aborted, true);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /event: done/);
});
