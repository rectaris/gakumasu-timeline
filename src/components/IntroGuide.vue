<script setup>
defineProps({
  menuOpen: { type: Boolean, required: true },
  manualOpen: { type: Boolean, required: true },
  onDismiss: { type: Function, required: true },
  onOpenLaneGuide: { type: Function, required: true },
  onOpenManual: { type: Function, required: true },
});
</script>

<template>
  <section
    class="intro-guide"
    role="region"
    aria-labelledby="intro-guide-title"
  >
    <div class="intro-guide__header">
      <p class="intro-guide__eyebrow">はじめて見る方向け</p>
      <button
        class="intro-guide__close"
        type="button"
        aria-label="案内を閉じる"
        title="案内を閉じる"
        @click="onDismiss"
      >
        ×
      </button>
    </div>
    <h2 id="intro-guide-title" class="intro-guide__title">
      まずは 3 ステップで見始められます
    </h2>
    <ol class="intro-guide__steps">
      <li>左上のメニューから見たいカテゴリやレーンを選ぶ</li>
      <li>
        画面下部の表示期間 / レーン密度の操作とホイールで、見たい範囲に合わせる
      </li>
      <li>イベントをクリックして右側の詳細を見る</li>
    </ol>
    <div class="intro-guide__actions">
      <button
        class="intro-guide__button intro-guide__button--primary"
        type="button"
        aria-label="表示レーンを見る"
        aria-haspopup="dialog"
        aria-controls="side-menu"
        :aria-expanded="menuOpen ? 'true' : 'false'"
        title="表示レーンを見る"
        @click="onOpenLaneGuide"
      >
        表示レーンを見る
      </button>
      <button
        class="intro-guide__button"
        type="button"
        aria-label="操作マニュアルを見る"
        aria-haspopup="dialog"
        aria-controls="manual-modal"
        :aria-expanded="manualOpen ? 'true' : 'false'"
        title="操作マニュアルを見る"
        @click="onOpenManual"
      >
        操作マニュアルを見る
      </button>
    </div>
    <p class="intro-guide__note">
      日付ラベルは実際の月日ではなく、前後関係を見やすくするために各月を 31
      日換算で並べた抽象時系列です。
    </p>
  </section>
</template>
