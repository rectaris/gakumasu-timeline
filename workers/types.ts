export const TIMELINE_ROLES = ["contributor", "reviewer", "admin"] as const;

export type TimelineRole = (typeof TIMELINE_ROLES)[number];

export type AccountActor = {
  accountId: string;
};

export type ToolSessionCookie = Readonly<{
  name: string;
  value: string;
}>;

export type AuthResult =
  | {
      status: "authenticated";
      actor: AccountActor;
      credential: ToolSessionCookie;
    }
  | { status: "anonymous" }
  | { status: "unavailable" };

export type ChangeRequestStatus = "submitted" | "approved" | "rejected";
export type ReviewDecision = "approved" | "rejected";
