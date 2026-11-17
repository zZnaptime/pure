/* BGM 설정 — 관리 화면의 'BGM' 에서 바꿔요 (직접 고쳐도 돼요)
   on : BGM 쓰기 · auto : 입장 버튼 누르면 자동 재생 · resume : Player / 글 음악이 멈추면 BGM 다시
   vol : 처음 볼륨 (0~100)
   tracks : 시즌별 곡 (base = 시즌 테마 꺼져 있을 때 · 비워 두면 base 곡)
   labels : LP 라벨 (type "color" | "image") · perSeason : true 면 시즌마다 따로 */
window.SY_BGM_CONF = {
  "v": 1,
  "on": true,
  "auto": true,
  "resume": true,
  "vol": 40,
  "tracks": {
    "base": { "src": "", "title": "", "artist": "" },
    "winter": { "src": "assets/bgm/winter.mp3", "title": "WINTER BGM", "artist": "ARCH CLINIC" },
    "summer": { "src": "", "title": "", "artist": "" }
  },
  "perSeason": false,
  "labels": {
    "base": { "type": "color", "color": "#2FA4DE", "image": "", "cross": true },
    "winter": { "type": "color", "color": "#8FDCFB", "image": "", "cross": true },
    "summer": { "type": "color", "color": "#B8E85A", "image": "", "cross": true }
  }
};
