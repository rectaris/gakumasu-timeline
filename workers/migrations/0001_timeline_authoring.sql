PRAGMA foreign_keys = ON;

CREATE TABLE role_grants (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL CHECK (length(account_id) BETWEEN 1 AND 128),
  role TEXT NOT NULL CHECK (role IN ('contributor', 'reviewer', 'admin')),
  granted_by_account_id TEXT NOT NULL CHECK (length(granted_by_account_id) BETWEEN 1 AND 128),
  granted_at INTEGER NOT NULL CHECK (granted_at > 0),
  revoked_by_account_id TEXT CHECK (revoked_by_account_id IS NULL OR length(revoked_by_account_id) BETWEEN 1 AND 128),
  revoked_at INTEGER CHECK (revoked_at IS NULL OR revoked_at >= granted_at),
  CHECK ((revoked_by_account_id IS NULL) = (revoked_at IS NULL))
);

CREATE UNIQUE INDEX role_grants_active_account_role
  ON role_grants (account_id, role)
  WHERE revoked_at IS NULL;
CREATE INDEX role_grants_account_active
  ON role_grants (account_id, revoked_at, role);

CREATE TABLE change_requests (
  id TEXT PRIMARY KEY,
  submitter_account_id TEXT NOT NULL CHECK (length(submitter_account_id) BETWEEN 1 AND 128),
  target_lane_id TEXT NOT NULL CHECK (length(target_lane_id) BETWEEN 1 AND 128),
  payload_json TEXT NOT NULL CHECK (length(payload_json) BETWEEN 2 AND 65536),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  submitted_at INTEGER NOT NULL CHECK (submitted_at > 0),
  updated_at INTEGER NOT NULL CHECK (updated_at >= submitted_at)
);

CREATE INDEX change_requests_submitter_status
  ON change_requests (submitter_account_id, status, submitted_at DESC);
CREATE INDEX change_requests_status_submitted
  ON change_requests (status, submitted_at ASC);

CREATE TABLE review_decisions (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE REFERENCES change_requests(id),
  reviewer_account_id TEXT NOT NULL CHECK (length(reviewer_account_id) BETWEEN 1 AND 128),
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  note TEXT CHECK (note IS NULL OR length(note) <= 4000),
  decided_at INTEGER NOT NULL CHECK (decided_at > 0)
);

CREATE INDEX review_decisions_reviewer
  ON review_decisions (reviewer_account_id, decided_at DESC);

CREATE TRIGGER role_grants_immutable_identity
BEFORE UPDATE ON role_grants
WHEN NEW.id IS NOT OLD.id
  OR NEW.account_id IS NOT OLD.account_id
  OR NEW.role IS NOT OLD.role
  OR NEW.granted_by_account_id IS NOT OLD.granted_by_account_id
  OR NEW.granted_at IS NOT OLD.granted_at
  OR OLD.revoked_at IS NOT NULL
BEGIN
  SELECT RAISE(ABORT, 'immutable role grant audit fields');
END;

CREATE TRIGGER role_grants_no_delete
BEFORE DELETE ON role_grants
BEGIN
  SELECT RAISE(ABORT, 'role grants are audit records');
END;

CREATE TRIGGER change_requests_guard_update
BEFORE UPDATE ON change_requests
WHEN NEW.id IS NOT OLD.id
  OR NEW.submitter_account_id IS NOT OLD.submitter_account_id
  OR NEW.target_lane_id IS NOT OLD.target_lane_id
  OR NEW.payload_json IS NOT OLD.payload_json
  OR NEW.submitted_at IS NOT OLD.submitted_at
  OR OLD.status <> 'submitted'
  OR NEW.status NOT IN ('approved', 'rejected')
  OR NEW.version <> OLD.version + 1
  OR NEW.updated_at < OLD.updated_at
BEGIN
  SELECT RAISE(ABORT, 'invalid change request transition');
END;

CREATE TRIGGER change_requests_no_delete
BEFORE DELETE ON change_requests
BEGIN
  SELECT RAISE(ABORT, 'change requests are audit records');
END;

CREATE TRIGGER review_decisions_match_request_status
BEFORE INSERT ON review_decisions
WHEN (SELECT status FROM change_requests WHERE id = NEW.request_id) IS NOT NEW.decision
BEGIN
  SELECT RAISE(ABORT, 'review decision must match request status');
END;

CREATE TRIGGER review_decisions_immutable
BEFORE UPDATE ON review_decisions
BEGIN
  SELECT RAISE(ABORT, 'review decisions are immutable');
END;

CREATE TRIGGER review_decisions_no_delete
BEFORE DELETE ON review_decisions
BEGIN
  SELECT RAISE(ABORT, 'review decisions are audit records');
END;
