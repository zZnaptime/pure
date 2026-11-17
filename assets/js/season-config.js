/* 시즌 테마 설정 — 관리 화면의 '시즌 테마' 에서 바꿔요 (직접 고쳐도 돼요)
   mode : "auto" = 아래 기간대로 저절로 · "off" = 끄기 · 시즌 id (예: "winter") = 기간 상관없이 지금 켜기
   seasons : 시즌마다 assets/css/season-<id>.css 와 assets/js/season-<id>.js 가 짝으로 있어요
   from / to : "월-일" (해를 넘겨도 돼요 · 예: 11-17 ~ 01-05) */
window.SY_SEASON_CONF = {
  "v": 2,
  "mode": "auto",
  "seasons": [
    { "id": "winter", "name": "겨울 · 연말", "from": "11-17", "to": "01-05", "favicon": true },
    { "id": "summer", "name": "여름", "from": "07-01", "to": "08-31", "favicon": true }
  ]
};