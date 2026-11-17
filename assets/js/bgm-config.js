/* BGM 설정 — 관리 화면의 'BGM' 에서 바꿔요 (직접 고쳐도 돼요)
   on : BGM 쓰기 · auto : 입장 버튼 누르면 자동 재생 · resume : Player / 글 음악이 멈추면 BGM 다시
   vol : 처음 볼륨 (0~100)
   tracks : 시즌별 곡 (base = 시즌 테마 꺼져 있을 때 · 비워 두면 base 곡)
   labels : LP 라벨 (type "color" | "image") · perSeason : true 면 시즌마다 따로 */
window.SY_BGM_CONF = {
  "v": 2,
  "on": true,
  "auto": true,
  "resume": true,
  "vol": 40,
  "tracks": {
    "base": {
      "src": "assets/bgm/ld.mp3",
      "title": "Love Disorder BGM ver.",
      "artist": "PURE×UXI"
    },
    "winter": {
      "src": "assets/bgm/winter.mp3",
      "title": "Remedy BGM ber.",
      "artist": "PURE×UXI"
    },
    "summer": {
      "src": "",
      "title": "",
      "artist": "PURE×UXI"
    }
  },
  "perSeason": true,
  "labels": {
    "base": {
      "type": "image",
      "color": "#2FA4DE",
      "image": "assets/bgm/label-base.webp",
      "cross": true
    },
    "winter": {
      "type": "image",
      "color": "#8FDCFB",
      "image": "assets/bgm/label-winter.webp",
      "cross": true
    },
    "summer": {
      "type": "color",
      "color": "#B8E85A",
      "image": "",
      "cross": true
    }
  }
};
