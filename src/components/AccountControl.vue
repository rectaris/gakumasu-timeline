<script setup>
import { inject, nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import {
  ACCOUNT_PAGE_URL,
  TOOL_SESSION_CONTEXT,
  TOOL_LOGIN_URL,
  createToolSessionState,
  isToolSessionOrigin,
  requestToolLogout,
  requestToolSession,
  transitionToolSessionState,
} from "../auth/toolSession";

const toolSessionContext = inject(TOOL_SESSION_CONTEXT, null);
const accountControlRef = ref(null);
const accountTriggerRef = ref(null);
const loginLinkRef = ref(null);
const logoutButtonRef = ref(null);
const disclosureOpen = ref(false);
const sessionState = reactive(
  createToolSessionState(
    isToolSessionOrigin(window.location) ? "checking" : "unavailable",
  ),
);

let sessionCheckVersion = 0;

function applySessionState(event) {
  Object.assign(
    sessionState,
    transitionToolSessionState({ ...sessionState }, event),
  );
}

async function checkSession() {
  if (!isToolSessionOrigin(window.location)) return;
  const version = ++sessionCheckVersion;
  const restoreLoginFocus = document.activeElement === accountTriggerRef.value;

  try {
    const session = await requestToolSession();
    if (version !== sessionCheckVersion) return;
    applySessionState({
      type: session.authenticated
        ? "session-authenticated"
        : "session-anonymous",
    });
  } catch {
    if (version !== sessionCheckVersion) return;
    applySessionState({ type: "session-unavailable" });
  }

  if (sessionState.status !== "authenticated") {
    disclosureOpen.value = false;
    if (restoreLoginFocus) {
      await nextTick();
      loginLinkRef.value?.focus();
    }
  }
}

function toggleDisclosure() {
  disclosureOpen.value = !disclosureOpen.value;
}

function closeDisclosure({ restoreFocus = false } = {}) {
  if (!disclosureOpen.value) return;
  disclosureOpen.value = false;
  if (restoreFocus) {
    void nextTick(() => accountTriggerRef.value?.focus());
  }
}

function handleDocumentPointerdown(event) {
  if (!disclosureOpen.value) return;
  const eventPath = event.composedPath?.() ?? [];
  if (
    eventPath.includes(accountControlRef.value) ||
    accountControlRef.value?.contains(event.target)
  ) {
    return;
  }
  closeDisclosure();
}

function handleDocumentKeydown(event) {
  if (event.key !== "Escape" || !disclosureOpen.value) return;
  event.preventDefault();
  event.stopPropagation();
  closeDisclosure({ restoreFocus: true });
}

function handleVisibilityChange() {
  if (
    document.visibilityState === "visible" &&
    sessionState.status !== "logging-out"
  ) {
    void checkSession();
  }
}

async function handleLogout() {
  if (sessionState.status !== "authenticated") return;
  sessionCheckVersion += 1;
  applySessionState({ type: "logout-started" });

  try {
    await requestToolLogout();
    applySessionState({ type: "logout-succeeded" });
    toolSessionContext?.logoutSucceeded();
    disclosureOpen.value = false;
    await nextTick();
    loginLinkRef.value?.focus();
  } catch {
    applySessionState({ type: "logout-failed" });
    disclosureOpen.value = true;
    await nextTick();
    logoutButtonRef.value?.focus();
  }
}

onMounted(() => {
  document.addEventListener("pointerdown", handleDocumentPointerdown);
  document.addEventListener("keydown", handleDocumentKeydown);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  if (sessionState.status === "checking") void checkSession();
});

onUnmounted(() => {
  sessionCheckVersion += 1;
  document.removeEventListener("pointerdown", handleDocumentPointerdown);
  document.removeEventListener("keydown", handleDocumentKeydown);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<template>
  <div ref="accountControlRef" class="account-control">
    <span
      v-if="sessionState.status === 'checking'"
      class="account-control__placeholder"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
      </svg>
      <span class="account-control__responsive-label">ログイン</span>
    </span>

    <a
      v-else-if="
        sessionState.status === 'anonymous' ||
        sessionState.status === 'unavailable'
      "
      ref="loginLinkRef"
      class="account-control__login-link"
      :href="TOOL_LOGIN_URL"
      aria-label="ログインページへ移動"
      title="ログインページへ移動"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
      </svg>
      <span class="account-control__responsive-label">ログイン</span>
    </a>

    <template v-else>
      <button
        ref="accountTriggerRef"
        class="account-control__trigger"
        type="button"
        aria-label="ログイン済み。アカウントメニューを開く"
        aria-controls="account-disclosure"
        :aria-expanded="disclosureOpen ? 'true' : 'false'"
        title="アカウントメニューを開く"
        @click="toggleDisclosure"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
        <span class="account-control__responsive-label">アカウント</span>
      </button>

      <div
        v-if="disclosureOpen"
        id="account-disclosure"
        class="account-control__disclosure"
        aria-label="アカウントメニュー"
      >
        <a class="account-control__action" :href="ACCOUNT_PAGE_URL">
          アカウントページを開く
        </a>
        <button
          ref="logoutButtonRef"
          class="account-control__action account-control__logout"
          type="button"
          :disabled="sessionState.status === 'logging-out'"
          @click="handleLogout"
        >
          {{
            sessionState.status === "logging-out"
              ? "ログアウト中…"
              : "ログアウト"
          }}
        </button>
        <p class="account-control__note">
          この操作後も、アカウントページはログインしたままです。
        </p>
        <p
          v-if="sessionState.logoutError"
          class="account-control__error"
          aria-hidden="true"
        >{{ sessionState.logoutError }}</p>
      </div>

      <p
        class="account-control__live"
        aria-live="polite"
        aria-atomic="true"
      >{{ sessionState.logoutError }}</p>
    </template>
  </div>
</template>

<style scoped>
.account-control {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
}

.account-control__login-link,
.account-control__trigger,
.account-control__placeholder {
  display: inline-flex;
  flex: 0 0 auto;
  min-width: var(--header-control-size);
  height: var(--header-control-size);
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid var(--border-strong);
  border-radius: var(--header-control-radius);
  background: var(--button-bg);
  color: var(--button-text);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
}

.account-control__trigger {
  cursor: pointer;
}

.account-control__placeholder {
  color: transparent;
  cursor: default;
}

.account-control__login-link:hover,
.account-control__trigger:hover {
  border-color: var(--border-strong);
  background: var(--surface-soft);
}

.account-control__login-link:focus-visible,
.account-control__trigger:focus-visible,
.account-control__action:focus-visible {
  outline: 2px solid var(--timeline-focus-stroke);
  outline-offset: 2px;
}

.account-control__login-link svg,
.account-control__trigger svg,
.account-control__placeholder svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.account-control__disclosure {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 1300;
  display: grid;
  width: min(280px, calc(100vw - 24px));
  box-sizing: border-box;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  background: var(--surface-elevated);
  box-shadow: 0 10px 28px var(--shadow);
  color: var(--text-primary);
}

.account-control__action {
  display: inline-flex;
  min-height: 36px;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  padding: 7px 10px;
  border: 1px solid var(--border-strong);
  border-radius: var(--header-control-radius);
  background: var(--button-bg);
  color: var(--button-text);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
}

.account-control__action:hover:not(:disabled) {
  background: var(--surface-soft);
}

.account-control__action:disabled {
  opacity: 0.6;
  cursor: wait;
}

.account-control__logout {
  width: 100%;
}

.account-control__note,
.account-control__error {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
}

.account-control__note {
  color: var(--text-muted);
}

.account-control__error {
  color: var(--text-primary);
  font-weight: 700;
}

.account-control__live {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-width: 620px) {
  .account-control__login-link,
  .account-control__trigger,
  .account-control__placeholder {
    padding: 0;
  }

  .account-control__responsive-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
