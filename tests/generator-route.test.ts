import assert from "node:assert/strict";
import test from "node:test";

import { POST } from "../app/api/generator/route";

delete process.env.REQUESTY_API_KEY;

function createRequest(body: string): Request {
  return new Request("http://localhost/api/generator", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body,
  });
}

async function postGenerator(body: string) {
  const response = await POST(createRequest(body) as never);
  const payload = await response.json();

  return {
    status: response.status,
    payload,
  };
}

test("POST returns 400 for malformed JSON", async () => {
  const response = await postGenerator("{");

  assert.equal(response.status, 400);
  assert.deepEqual(response.payload, { error: "Invalid JSON body" });
});

test("POST returns 400 for null contentType", async () => {
  const response = await postGenerator(
    JSON.stringify({
      contentType: null,
      audience: "Parents",
      goal: "Présenter les admissions",
      tone: "clair",
      angle: "Valoriser l'accompagnement",
    }),
  );

  assert.equal(response.status, 400);
  assert.match(response.payload.error, /Invalid contentType/);
});

test("POST returns 400 for unknown contentType", async () => {
  const response = await postGenerator(
    JSON.stringify({
      contentType: "not_in_list",
      audience: "Parents",
      goal: "Présenter les admissions",
      tone: "clair",
      angle: "Valoriser l'accompagnement",
    }),
  );

  assert.equal(response.status, 400);
  assert.match(response.payload.error, /Invalid contentType/);
});

test("POST returns generated content for a valid contentType", async () => {
  const response = await postGenerator(
    JSON.stringify({
      contentType: "article blog",
      audience: "Parents",
      goal: "Présenter les admissions",
      tone: "clair",
      angle: "Valoriser l'accompagnement",
    }),
  );

  assert.equal(response.status, 200);
  assert.equal(response.payload.generated.fallback, true);
  assert.equal(typeof response.payload.generated.title, "string");
});
