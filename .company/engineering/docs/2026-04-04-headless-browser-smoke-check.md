# 2026-04-04 Headless Browser Smoke Check

## Scope

- `http://127.0.0.1:4173/gakumasu-timeline/`
- desktop width screenshot
- mobile width screenshot

## Method

- `npm run preview -- --host 127.0.0.1 --port 4173`
- `google-chrome-stable --headless=new --dump-dom`
- `google-chrome-stable --headless=new --screenshot`

## Result

- desktop width でアプリ初期表示の DOM を確認した
- desktop width screenshot では、intro-guide、タイムライン本体、ズーム操作エリアが描画されている
- mobile width screenshot でも、intro-guide とズーム操作エリアは表示され、即時の崩れは見えない

## Remaining Risk

- Windows Chrome 実機確認は未実施
- wheel / drag / panel close などの操作確認は headless screenshot だけでは十分ではない
