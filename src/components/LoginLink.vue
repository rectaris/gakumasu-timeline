<template>
  <a
    class="login-link"
    href="https://curiretas.com/auth/login?return_to=%2Fgakumastool%2Ftimeline%2F"
    aria-label="ログインページへ移動"
    title="ログインページへ移動"
  >
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
    </svg>
    <span class="login-link__label">ログイン</span>
  </a>
</template>

<style scoped>
.login-link {
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
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
}

.login-link:hover {
  border-color: var(--border-strong);
  background: var(--surface-soft);
}

.login-link:focus-visible {
  outline: 2px solid var(--timeline-focus-stroke);
  outline-offset: 2px;
}

.login-link svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@media (max-width: 620px) {
  .login-link {
    padding: 0;
  }

  .login-link__label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
</style>
