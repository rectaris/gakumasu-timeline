import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import worker from "../../workers";

const ORIGIN = "https://curiretas.com";
const API = `${ORIGIN}/gakumastool/timeline/api/authoring`;

const cookie = (accountId: string): string =>
  `__Host-curiretas_gakumastool_session=${accountId}`;

const dispatch = (
  path: string,
  accountId: string | null,
  init: RequestInit = {},
): Promise<Response> => {
  const headers = new Headers(init.headers);
  if (accountId) headers.set("Cookie", cookie(accountId));
  return worker.fetch(new Request(`${API}${path}`, { ...init, headers }), env);
};

const seedRole = async (
  accountId: string,
  role: "contributor" | "reviewer" | "admin",
): Promise<void> => {
  await env.TIMELINE_DB.prepare(
    `INSERT INTO role_grants
       (id, account_id, role, granted_by_account_id, granted_at)
     VALUES (?1, ?2, ?3, 'test-bootstrap', ?4)`,
  )
    .bind(crypto.randomUUID(), accountId, role, Date.now())
    .run();
};

const validContribution = (id = `event_${crypto.randomUUID()}`) => ({
  targetLaneId: "saki_hanami",
  event: {
    id,
    start: { year: 1, month: 4, day: 1 },
    end: { year: 1, month: 4, day: 1 },
    title: "申請イベント",
    detail: "審査対象のイベント",
    occurrenceType: "singleWithinRange",
    participants: ["saki_hanami"],
  },
});

const jsonMutation = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: ORIGIN },
  body: JSON.stringify(body),
});

describe("timeline authoring Worker", () => {
  it("derives identity through the filtered tool session cookie", async () => {
    const accountId = `contributor-${crypto.randomUUID()}`;
    await seedRole(accountId, "contributor");
    const response = await worker.fetch(
      new Request(`${API}/me`, {
        headers: {
          Cookie: `unrelated=do-not-forward; ${cookie(accountId)}; another=value`,
        },
      }),
      env,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      authenticated: true,
      roles: ["contributor"],
    });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns generic authentication and upstream failures", async () => {
    const anonymous = await dispatch("/me", "anonymous");
    const malformed = await dispatch("/me", "malformed");
    const upstream = await dispatch("/me", "upstream-error");

    expect(anonymous.status).toBe(401);
    expect(malformed.status).toBe(503);
    expect(upstream.status).toBe(503);
    expect(JSON.stringify(await malformed.json())).not.toContain("malformed");
  });

  it("enforces roles, exact origins, and payload limits", async () => {
    const contributor = `contributor-${crypto.randomUUID()}`;
    await seedRole(contributor, "contributor");

    const missingOrigin = await dispatch(
      "/requests",
      contributor,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validContribution()),
      },
    );
    const crossOrigin = await dispatch(
      "/requests",
      contributor,
      {
        ...jsonMutation(validContribution()),
        headers: {
          "Content-Type": "application/json",
          Origin: "https://attacker.example",
        },
      },
    );
    const tooLarge = await dispatch(
      "/requests",
      contributor,
      jsonMutation({ padding: "x".repeat(66000) }),
    );
    const reviewQueue = await dispatch("/requests?scope=review", contributor);

    expect(missingOrigin.status).toBe(403);
    expect(crossOrigin.status).toBe(403);
    expect(tooLarge.status).toBe(413);
    expect(reviewQueue.status).toBe(403);
  });

  it("applies the shared timeline validation before storing a request", async () => {
    const contributor = `contributor-${crypto.randomUUID()}`;
    await seedRole(contributor, "contributor");

    const duplicate = await dispatch(
      "/requests",
      contributor,
      jsonMutation(validContribution("001_birth")),
    );
    const invalidDate = validContribution();
    invalidDate.event.start.month = 13;
    const invalid = await dispatch(
      "/requests",
      contributor,
      jsonMutation(invalidDate),
    );
    const valid = await dispatch(
      "/requests",
      contributor,
      jsonMutation(validContribution()),
    );

    expect(duplicate.status).toBe(422);
    expect(invalid.status).toBe(422);
    expect(valid.status).toBe(201);
  });

  it("prevents contributors from reading another account request", async () => {
    const owner = `owner-${crypto.randomUUID()}`;
    const stranger = `stranger-${crypto.randomUUID()}`;
    await seedRole(owner, "contributor");
    await seedRole(stranger, "contributor");
    const submitted = await dispatch(
      "/requests",
      owner,
      jsonMutation(validContribution()),
    );
    const body = await submitted.json<{ request: { id: string } }>();

    expect((await dispatch(`/requests/${body.request.id}`, owner)).status).toBe(200);
    expect(
      (
        await dispatch(`/requests/${body.request.id}`, stranger, {
          headers: { "X-User-Id": owner },
        })
      ).status,
    ).toBe(404);
  });

  it("allows exactly one optimistic review and retains audit fields", async () => {
    const contributor = `contributor-${crypto.randomUUID()}`;
    const reviewer = `reviewer-${crypto.randomUUID()}`;
    await seedRole(contributor, "contributor");
    await seedRole(reviewer, "reviewer");
    const submitted = await dispatch(
      "/requests",
      contributor,
      jsonMutation(validContribution()),
    );
    const submission = await submitted.json<{ request: { id: string; submittedAt: number } }>();

    const [approve, reject] = await Promise.all([
      dispatch(
        `/requests/${submission.request.id}/decision`,
        reviewer,
        jsonMutation({ decision: "approved", version: 1, note: "確認済み" }),
      ),
      dispatch(
        `/requests/${submission.request.id}/decision`,
        reviewer,
        jsonMutation({ decision: "rejected", version: 1, note: "競合" }),
      ),
    ]);
    expect([approve.status, reject.status].sort()).toEqual([200, 409]);

    const requestRow = await env.TIMELINE_DB.prepare(
      `SELECT status, version, submitter_account_id, submitted_at, updated_at
       FROM change_requests WHERE id = ?1`,
    )
      .bind(submission.request.id)
      .first<{
        status: string;
        version: number;
        submitter_account_id: string;
        submitted_at: number;
        updated_at: number;
      }>();
    const decisions = await env.TIMELINE_DB.prepare(
      `SELECT reviewer_account_id, decision, decided_at
       FROM review_decisions WHERE request_id = ?1`,
    )
      .bind(submission.request.id)
      .all<{ reviewer_account_id: string; decision: string; decided_at: number }>();

    expect(requestRow?.submitter_account_id).toBe(contributor);
    expect(requestRow?.version).toBe(2);
    expect(requestRow?.updated_at).toBeGreaterThanOrEqual(requestRow?.submitted_at ?? 0);
    expect(decisions.results).toHaveLength(1);
    expect(decisions.results[0]?.reviewer_account_id).toBe(reviewer);
    expect(decisions.results[0]?.decided_at).toBeGreaterThanOrEqual(
      submission.request.submittedAt,
    );
  });

  it("audits administrator grants and revocations", async () => {
    const admin = `admin-${crypto.randomUUID()}`;
    const target = `target-${crypto.randomUUID()}`;
    await seedRole(admin, "admin");
    const granted = await dispatch(
      "/roles",
      admin,
      jsonMutation({ accountId: target, role: "reviewer" }),
    );
    const grant = await granted.json<{ grant: { id: string } }>();
    const revoked = await dispatch(`/roles/${grant.grant.id}`, admin, {
      method: "DELETE",
      headers: { Origin: ORIGIN },
    });
    const row = await env.TIMELINE_DB.prepare(
      `SELECT account_id, role, granted_by_account_id, granted_at,
              revoked_by_account_id, revoked_at
       FROM role_grants WHERE id = ?1`,
    )
      .bind(grant.grant.id)
      .first<{
        account_id: string;
        role: string;
        granted_by_account_id: string;
        granted_at: number;
        revoked_by_account_id: string;
        revoked_at: number;
      }>();

    expect(granted.status).toBe(201);
    expect(revoked.status).toBe(200);
    expect(row).toMatchObject({
      account_id: target,
      role: "reviewer",
      granted_by_account_id: admin,
      revoked_by_account_id: admin,
    });
    expect(row?.revoked_at).toBeGreaterThanOrEqual(row?.granted_at ?? 0);
  });
});
