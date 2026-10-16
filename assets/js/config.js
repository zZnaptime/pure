/* ══════════════════════════════════════════════════════════════
   SYRINGE — 콘텐츠 설정 (플레이리스트 / 메신저 / 알림 / 인터넷 / 링크 허브)
   이 파일은 코드로 직접 고치는 곳이에요. (홈 문구·D+ 날짜 등은 settings.json → 관리자 화면)
   이미지·음악은 저장소의 assets/images 에 넣고  'assets/images/파일이름'  처럼 쓰면 돼요.
══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
       ♪ 플레이리스트 — 여기만 고치면 플레이어에 반영돼요
       url    : mp3 주소 (저장소 assets/images 폴더에 넣은 파일은 아래처럼 쓰면 됨)
       title  : 곡 제목 / artist : 아티스트 / cover : 앨범 이미지
       color  : 그 곡을 틀 때 플레이어 배경색
       lrc    : 가사. [분:초.소수] 가사  형식으로 한 줄씩 (\n 으로 줄바꿈)  — LRC 파일 내용 그대로 붙여도 돼요
══════════════════════════════════════════════════════════════════ */

  window.SY_TRACKS = [
    {
      url: 'assets/music/Love-Disorder.mp3',
      title: 'Love Disorder',
      artist: 'PURE × UXI',
      color: '#2A9C8E',
      lrc: '[00:00.0]♪ Love Disorder\n[00:08.0](가사 준비 중)',
      cover: 'assets/music/lovedisorder.png'
    },
    {
      url: 'assets/music/B-P-M.mp3',
      title: 'B-P-M',
      artist: 'PURE × UXI',
      color: '#2F7FC1',
      lrc: '[00:00.0]♪ B-P-M\n[00:06.0](가사 준비 중)\n[00:12.0]기다려주세요...',
      cover: 'assets/music/bpm.png'
    },
    {
      url: 'assets/music/Pace-10.mp3',
      title: 'Pace 10',
      artist: 'PURE × UXI',
      color: '#617aad',
      lrc: "[00:15.68] 햇살이 닿은 pillow, 늦은 아침 10\n[00:19.18] Don’t wanna check my phone, just stay in bed\n[00:22.36] 잔잔한 바람이 커튼을 스치고\n[00:26.30] 특별할 것 없는 하루가 좋아 난\n[00:30.02] 서두를 필욘 없잖아\n[00:32.93] Everything’s moving so fast, but not us\n[00:36.32] 이어폰 한쪽씩 나눠 낀 채로\n[00:40.35] Just let the music drift\n[00:44.57] One and two step, 발걸음은 slow\n[00:48.06] 어디든 상관없어, fade to white\n[00:51.65] 소음은 전부 mute, 세상은 blur\n[00:55.31] 오직 너와 나만 남아 선명해져\n[01:00.01] Off, off, take it off─\n[01:01.84] Ride on the slow wave, 천천히 흘러가\n[01:05.04] No rushing, no drama, nothing to prove\n[01:08.61] 네 숨소리에 맞춰 리듬을 타\n[01:12.24] Yeah we glide, yeah we float\n[01:14.07] 이대로 좋아, just you and me\n[01:29.88] 시계 초침 소리마저 옅어져 가\n[01:32.26] All the little worries, let 'em wash away\n[01:34.16] 발끝을 맞추며 가볍게 sway\n[01:35.87] 눈을 감으면 시작되는 우리 둘만의 pace\n[01:38.05] Step back, 긴장은 내려놔\n[01:39.81] 흘러가는 대로 just like that\n[01:41.38] 알람은 다 turn off, 세상은 pause\n[01:43.24] 눈을 맞출수록 또렷해져 가\n[01:45.06] One and two step, 발걸음은 slow\n[01:47.60] 어디든 상관없어, fade to white\n[01:51.10] 소음은 전부 mute, 세상은 blur\n[01:54.77] 오직 네 숨소리만 가까워져 와\n[01:59.56] Off, off, take it off─\n[02:01.26] Ride on the slow wave, 천천히 흘러가\n[02:04.44] No rushing, no drama, nothing to prove\n[02:08.02] 네 숨소리에 맞춰 리듬을 타\n[02:11.64] Yeah we glide, yeah we float\n[02:13.48] 이대로 좋아, just you and me\n[02:29.35] 세상이 다 바쁘게 돌아가도\n[02:33.88] 우린 이 작은 방 안에 멈춰 있어\n[02:37.21] Soft afternoon, fading light\n[02:40.97] All that I need is right here\n[02:44.54] Ride on the slow wave, 천천히 흘러가\n[02:47.60] No rushing, no drama, nothing to prove\n[02:51.21] 네 숨소리에 맞춰 리듬을 타\n[02:54.79] Yeah we glide, yeah we float\n[02:56.60] 이대로 좋아, just you and me\n[03:04.49] Mm, just slow it down\n[03:09.16] On the slow wave\n[03:10.90] Let it drift away",
      cover: 'assets/music/pace10.png'
    },
    {
      url: 'assets/music/Catch.mp3',
      title: 'Catch',
      artist: 'PURE × UXI',
      color: '#160fa2',
      lrc: "[00:01.16] (Ready or not, here I come)\n[00:07.15] (Tick-tock, somewhere in the dark)\n[00:13.55] 시계는 자꾸 같은 곳을 가리키고\n[00:17.22] 나는 그 사이를 슬쩍 빠져나가\n[00:20.68] 가로등이 길게 늘어진 골목 끝\n[00:23.72] 방금 전까지 있던 온기가 남아\n[00:27.47] 한 박자 늦은 밤은 네 흔적을 닮아서\n[00:31.16] 쉽게 잡혀줄 생각 없는 너\n[00:34.48] 이름을 부르면 멀어질 것 같아서\n[00:38.00] 나는 아무 말 없이 뒤를 따라가\n[00:41.60] 희미한 발자국, 젖은 바닥 위로\n[00:44.71] 모른 척 돌아선 네 뒷모습\n[00:48.27] 가까워질수록 선명해지는 것들\n[00:51.31] 손을 뻗으면 다시 꿈처럼 흐려져\n[00:54.48] 셋을 세는 동안 밤이 깊어져\n[00:56.91] Catch me if you can,\n[00:58.27] 우리 사이엔 아직 밤이 남아\n[01:00.58] 닿을 듯 멀어지는 작은 온도\n[01:03.59] 네가 한 걸음 오면 나는 빛이 되고\n[01:06.92] 네가 사라지면 나는 그 빛을 따라\n[01:10.31] 멈추지 않는 이, 이 밤의 박자\n[01:16.28] Catch me if you can\n[01:19.76] Catch me if you can\n[01:24.95] 유리창에 스친 얼굴 하나\n[01:27.93] 낯선 사람처럼 웃고 있더라\n[01:30.83] 어느새 누가 숨어 있는 건지\n[01:34.49] 찾는 건지, 기다리는 건지\n[01:38.08] 손끝에 남은 건 아주 잠깐의 온기\n[01:41.79] 잡았다고 믿을 즈음 식어가고\n[01:45.04] 끝나지 않는 게 꼭 나쁜 건 아니잖아\n[01:48.60] 조금 더 먼 곳에서 이름을 불러줘\n[01:53.42] 어둠은 깊어질수록 투명해지고\n[01:56.52] 내가 없는 곳에서 네가 선명해져\n[01:59.97] 돌아갈까 말까\n[02:01.36] 이미 늦은 것 같아\n[02:03.15] 새벽은 아직 오지 않았으니까\n[02:07.81] Catch me if you can,\n[02:09.09] 우리 사이엔 아직 말이 남아\n[02:11.34] 잡힐 듯 사라지는 마음의 모서리\n[02:14.38] 네가 한 걸음 오면 나는 저편으로\n[02:17.65] 멀어지는 만큼 더 가까워져\n[02:21.13] 멈추지 않는 이, 이 밤의 박자\n[02:26.93] Catch me if you can\n[02:30.45] Catch me if you can\n[02:35.75] 한 번의 hesitation, 넌 또 사라져\n[02:39.20] 뒤돌아보면 내가 네 곁에 있어\n[02:42.57] Who's hunting who?\n[02:43.90] 어쩌면 처음부터\n[02:45.70] 서로를 붙잡고 싶었던 건 아닐까\n[02:50.12] Catch me if you can,\n[02:51.18] 끝나지 않는 밤을 건너가\n[02:53.69] 닿을 때마다 다른 이름이 되는 우리\n[02:56.95] 뒤돌아보면 또 네가 있을 것 같아\n[03:00.32] 눈을 감아도 너는 사라지지 않아\n[03:03.31] 우리가 만든 밤은 아직 움직여\n[03:09.30] Catch me if you can\n[03:12.82] Catch me if you can\n[03:18.32] Game set.\n[03:20.66] 아직 끝나지 않은 것처럼\n[03:25.39] Catch, catch—\n[03:28.29] if you can.\n[03:32.45] Catch, catch—\n[03:35.14] if you can.\n[03:39.48] Catch, catch—\n[03:42.38] if you can.",
      cover: 'assets/music/catch.png'
    },
    {
      url: 'assets/music/0dB.mp3',
      title: '0dB',
      artist: 'PURE × UXI',
      color: '#81b5bb',
      lrc: "[00:12.41] Read at two lock the clock.\n[00:14.28] 화면 깜빡, On, off\n[00:16.02] 선은 꼬여있고\n[00:17.65] 알림 배지는 빨간색\n[00:19.65] 그냥 엎어놔 폰\n[00:21.22] 파란 빛깔 잔상, 빛의 Flashback\n[00:24.58] 눈만 껌뻑이다 궤도를 Track back\n[00:28.41] 벽에 걸린 시계 초침 째깍, stop it\n[00:32.12] 핑 도는 머리, 과부하 Circuit\n[00:34.12] (Pull it out, break it, don't miss it)\n[00:36.00] 플러그 끝을 잡고 툭 끊어내는 Limit\n[00:39.66] 선 끊긴 채로 미끄러져 훅 In a minute\n[00:43.50] Down, down, drop the sound\n[00:45.34] 잡음 섞인 밤은 skip\n[00:47.18] BPM 낮추고 발끝을 탭\n[00:50.33] (Tick, tack, toe)\n[00:50.85] Off, off, take it off\n[00:52.54] 세상 볼륨 다 줄여\n[00:54.53] 벽 너머 소리들 Fade out\n[00:57.12] 여긴 우리만, 0dB\n[01:00.59] 남은 건 너랑 나, 딱 둘\n[01:04.22] 여긴 우리 방, 0dB\n[01:07.25] 남은 건 너랑 나, 딱 둘\n[01:11.92] 차가워진 창문 틈\n[01:13.68] 손가락으로 슥 긁어\n[01:15.49] 말끝은 흐려도\n[01:17.06] 대충 다 알아듣잖아\n[01:19.04] 응, 다 아니까\n[01:20.25] 굳이 긴 말 안 붙여\n[01:22.08] 내 주머니 속 너와 Groove\n[01:24.08] 손끝 부딪히는 소리 툭\n[01:26.16] 복잡한 수식어는 cut\n[01:28.05] (Mute it all)\n[01:28.60] 바닥에 떨어진 베이스 쿵\n[01:30.12] 우린 박자만 타면 돼, 둥\n[01:34.07] Down, down, drop the sound\n[01:35.77] 잡음 섞인 밤은 skip\n[01:37.56] BPM 낮추고 발끝을 탭\n[01:40.71] (Tick, tack, toe)\n[01:41.27] Off, off, take it off\n[01:42.99] 세상 볼륨 다 줄여\n[01:45.03] 벽 너머 소리들 Fade out\n[01:47.50] 여긴 우리만, 0dB\n[01:50.41] 남은 건 너랑 나, 딱 둘\n[01:54.62] 여긴 우리 방, 0dB\n[01:57.63] 남은 건 너랑 나, 딱 둘\n[02:02.86] 침묵도 쪼개면 리듬이 돼\n[02:05.94] 빈틈 사이로 멜로디가 새\n[02:09.48] 선 없이도 우린 연결돼\n[02:17.18] ♪\n[02:31.44] Down, down, drop the sound\n[02:33.28] 플러그 뽑힌 채로 drift\n[02:35.08] 서늘한 공기, 선명한 숨\n[02:37.53] (Just stay right here)\n[02:38.71] Off, off, take it off\n[02:40.48] 세상 셔터는 닫혀\n[02:41.92] 새벽 세 시의 무중력\n[02:43.78] 아무 간섭 없는 Loop\n[02:45.20] 여긴 우리만, 0dB\n[02:48.58] 남은 건 너랑 나, 우리\n[02:52.16] Click.\n[02:52.66] Unplugged.\n[02:53.67] Unplugged.\n[02:54.35] Unplugged.\n[02:55.45] Unplugged.\n[02:56.15] Unplugged.\n[02:57.22] Unplugged.",
      cover: 'assets/music/0db.png'
    }
  ];

/* ══════════════════════════════════════════════════════════════
       💬 메신저 대화방 — 방을 늘리거나 대사를 바꾸려면 여기만 고치면 돼요
       members : 이 방에 있는 사람 (avatar: 'pure' / 'uxi' / 이미지 주소 / 비우면 이름 첫 글자)
       log     : 처음부터 보이는 대화 (from: 'me' = 유시가 보낸 것, 아니면 보낸 사람 이름)
       replies / keywords : 유시가 말을 보내면 이 중에서 답장 (keywords 단어가 들어가면 그쪽 우선)
══════════════════════════════════════════════════════════════════ */

  window.SY_CHAT = {
    me: 'UXI',
    stickers: ['💉', '💊', '🤍', '🩹'],
    rooms: [
      {
        id: 'pure', name: 'PURE', sub: '의무실 · 온라인',
        members: [{ name: 'PURE', avatar: 'pure' }],
        log: [
          { from: 'PURE', text: '일어났어? 도시락 두고 갈까 아니면 직접 먹여줄까~.' },
          { from: 'me', text: '오빠 나 5분만 더 잘래' },
          { from: 'me', text: '제발' },
          { from: 'me', text: '연구실에 박혀있다가 4시에 잤단 말이야...' },
          { from: 'PURE', text: '... 4시? 우리 고양이 또 혼자 무리했네.' },
          { from: 'PURE', text: '밥 안 먹으면 오늘 의무실 호출해서 링거 꽂을 건데' },
          { from: 'PURE', text: '선택해. 얌전히 문 열어줄래 아니면 내가 마스터키로 들어갈까?' },
          { from: 'me', text: '협박범 진짜' },
          { from: 'me', text: '열어놨어ㅡㅡ' }
        ],
        replies: [
          '응, 듣고 있어. 계속 말해.',
          '그 말 녹음해둔다?',
          '착하다. 이제 의무실로 와, 우리 연이.',
          '…또 무리했지? 데리러 갈게.',
          '5분 지났어, 유시야.',
          '선택해. 내 말 들을래, 아니면 다른 방법을 한 번 써볼까?'
        ],
        keywords: [
          { k: ['밥', '배고', '먹'], r: ['오빠가 도시락 집무실에 두고 갈게! 다 먹으면 사진 보내ㅎㅎ', '밥 또 안 먹었지. 오빠가 지금 갈게.'] },
          { k: ['잘', '졸', '피곤', '자'], r: ['으이구, 또 무리했지. 얼른 자. 대신 일어나면 바로 연락하는 거다?', '좀 쉴래?'] },
          { k: ['좋아', '사랑', '보고싶', '보고 싶'], r: ['먼저 이런 말을? ...나도, 나도 사랑해 연아.', '그런 말은 얼굴 보고 해줘야지.'] },
          { k: ['아파', '아프', '다쳤'], r: ['어디. 지금 바로 말해.', '움직이지 마. 의무실 비워둘게.'] }
        ]
      },
      {
        id: 'ward', name: 'ARCH 의무실 🩺', sub: '3명',
        members: [{ name: 'PURE', avatar: 'pure' }, { name: '메딕', avatar: '' }, { name: '신입 가이드', avatar: '' }],
        log: [
          { from: '메딕', text: '오늘 야간 당직 누구죠?' },
          { from: 'PURE', text: '저요. 유시 요원 정기검진도 오늘 제가 볼게요.' },
          { from: '신입 가이드', text: '퓨어쌤 그거 매일 하시는 거 아니에요…?' },
          { from: 'PURE', text: '정기검진이라니까ㅎㅎ' }
        ],
        replies: [
          { from: 'PURE', text: '연이 왔어?' },
          { from: '메딕', text: '어, 유시 씨 오셨어요?' },
          { from: '신입 가이드', text: '퓨어쌤 막 웃으시는데요?;;' },
          { from: '메딕', text: '공지 확인 부탁드려요~' },
          { from: '신입 가이드', text: 'ㅋㅋㅋㅋㅋ' }
        ],
        keywords: [
          { k: ['퓨어', '오빠'], r: [
            { from: '신입 가이드', text: '퓨어 쌤 지금 회진 중이세요!' },
            { from: '메딕', text: '퓨어 쌤 아까부터 폰만 보시던데요' }
          ] }
        ]
      },
      {
        id: 'bot', name: 'ARCH 안내봇', sub: '자동 응답 · 키워드를 눌러보세요',
        /* 오픈채팅 봇처럼 보여줄 키워드 목록 (k: 보낼 단어 / d: 설명) */
        menu: [
          { k: 'D-DAY', d: '퓨어 × 유시 페어 기록' },
          { k: '검진', d: '정기검진 일정' },
          { k: '퓨어', d: '담당 가이드 정보' },
          { k: '도움말', d: '키워드 목록 확인' }
        ],
        members: [{ name: 'ARCH 안내봇', avatar: '' }],
        log: [
          { from: 'ARCH 안내봇', text: '안녕하세요. ARCH 메디컬 센터 안내봇입니다 ✚' },
          { from: 'ARCH 안내봇', text: '아래 키워드를 누르거나 직접 보내보세요 ✚' }
        ],
        replies: ['접수되었습니다. 담당 가이드에게 전달할게요.', '해당 요청은 의무실(3F)로 문의해주세요.'],
        keywords: [
          { k: ['디데이', 'D-DAY', 'd-day', '며칠'], r: ['PURE × UXI 함께한 지 오늘로 {dday}일째입니다.'] },
          { k: ['검진'], r: ['UXI 님의 다음 정기검진은 "퓨어 쌤 마음대로"로 예약되어 있습니다.'] },
          { k: ['퓨어'], r: ['A-CLASS Guide PURE — 현재 상태: 유시 생각 중'] }
        ]
      }
    ]
  };

  /* ══════════════════════════════════════════════════════
     🔔 알림 팝업 — 홈에서 가끔 떠요 (app: 누르면 열 창)
     ══════════════════════════════════════════════════════ */
  window.SY_NOTI = {
    first: 12,          /* 처음 알림까지 (초) */
    every: [40, 80],    /* 그 다음부터 이 사이 랜덤 (초) */
    list: [
      { app: 'chat', icon: 'pure', title: 'PURE', text: '물 마셨어? 오빠한테 알려줘' },
      { app: 'chat', icon: 'pure', title: 'PURE', text: '지금 어디야? 위치 공유 꺼놨어?' },
      { app: 'chat', icon: 'pure', title: 'PURE', text: '오늘은 좀 어때? 어제 늦게까지 일하느라 피곤했을 텐데ㅠㅠ' },
      { app: 'chat', icon: 'pure', title: 'PURE', text: '우리 연이가 좋아하는 아아 한 잔 미리 빼놨어☕ 의무실로 수령하러 오시죠 공주님ㅎㅎ' },
      { app: 'chat', icon: 'pure', title: 'PURE', text: '방금 복도에서 스쳐 지나갔는데, 나 못 봤지? 우리 고양이ㅋㅋ' },
      { app: 'chat', icon: 'pure', title: 'PURE', text: '연아, 혹시 오늘 저녁에 약속 있어? 오빠랑 파스타 먹으러 갈까' },
      { app: 'chat', icon: 'pure', title: 'PURE', text: 'https://ArchTube.com/CuT3c8t<br>주인한테 꾹꾹이 해주는 거래ㅋㅋㅋㅋ 너 같아' },
      { app: 'chat', icon: 'pure', title: 'PURE', text: '으, 의무실에서 기운 다 빨렸어. 목소리 들으면 바로 충전될 것 같은데... 3분만 통화 안 될까?' },
      { app: 'chat', icon: 'pure', title: 'PURE', text: '어제 네가 재밌다고 했던 애니메이션, 아까 점심시간에 1화 봤다? 이거 완전 내 스타일인데? 오늘 밤에 같이 정주행 달려야겠다.' },
      { app: 'chat', icon: 'pure', title: 'PURE', text: '훈련 중에 다치지 말고, 힘들면 꼭 중간중간 쉬어가면서 해. 네 몸 오빠 꺼잖아ㅡㅡ' },
      { app: 'chat', icon: 'pure', title: 'PURE', text: '회의 끝나면 오빠한테 연락 좀!' },
      { app: 'chat', icon: 'pure', title: 'PURE', text: '🤍' },
      { app: 'chat', icon: 'pure', title: 'PURE', text: '💉' },
      { app: 'radar', icon: 'care', title: 'Sentinel Care', text: "센티넬 <b>'UXI'</b> 심박 상승 감지 · 확인이 필요해요" },
      { app: 'dday', icon: 'heart', title: 'D-DAY', text: 'PURE × UXI 함께한 지 {dday}일째 ♥' },
      { app: 'kit', icon: 'kit', title: 'Med Kit', text: '오늘의 조제 미션이 도착했어요 💊' },
      { app: 'web', icon: 'web', title: 'PUREFLIX', text: '<b>백현</b> 님이 보던 드라마의 새 에피소드가 올라왔어요' },
      { app: 'player', icon: 'music', title: 'Player', text: '지금 이 노래 어때요? ♪' },
      { app: 'aol', icon: 'game', title: 'ARCH of Legends', text: '<b>무리하지마</b> 님이 게임에 초대했어요' },
      { app: 'aol', icon: 'game', title: 'ARCH of Legends', text: '의무실에 바이러스 출현! 방어전에 참여하세요' },
    ]
  };

  /* ══════════════════════════════════════════════════════
     🌐 인터넷 — 퓨어의 OTT / 유시의 게임 전적 사이트
     poster / img 에 이미지 주소를 넣으면 사진이 나와요 (비우면 기본 그림)
     ══════════════════════════════════════════════════════ */
  window.SY_WEB = {
    ott: {
      name: 'Pureflix', user: '백현',
      shows: [
        { title: '너의 파장이 보여', ep: 'S2 · 12화', watched: '41:20', total: '62:10', poster: 'assets/images/ott1.png', tag: '이어보기' },
        { title: '나의 A급 수호천사! (※천사가 아니었다?!)', ep: '1기 · 1화', watched: '7:02', total: '24:30', poster: 'assets/images/ott2.png', tag: '정주행' },
        { title: '우리 옆집에 간호사가 산다', ep: '3화', watched: '58:44', total: '70:00', poster: 'assets/images/ott3.png', tag: '곧 끝나요' },
        { title: '2026 ACK 결승전', ep: 'PUR vs UXI | 매치 하이라이트', watched: '4:11', total: '95:01', poster: 'assets/images/ott4.png', tag: '유연 님이 시청 중' }
      ]
    },
    game: {
      name: 'ARCH.GG', user: '명령하지마라#YEON', tier: 'GRANDMASTER', lp: 812, win: 186, lose: 121, main: 'Sentinel',
      matches: [
        { res: 'W', mode: '솔로 랭크', char: '센티넬', kda: '12 / 2 / 9', time: '28분', ago: '12분 전' },
        { res: 'W', mode: '솔로 랭크', char: '암살자', kda: '9 / 3 / 14', time: '31분', ago: '1시간 전' },
        { res: 'L', mode: '듀오 랭크', char: '센티넬', kda: '7 / 6 / 5', time: '25분', ago: '새벽 4:02' },
        { res: 'W', mode: '일반', char: '탱커', kda: '5 / 1 / 22', time: '22분', ago: '어제 · 듀오' }
      ],
      guide: { title: '센티넬 S급 공략: 폭주 게이지 관리법', by: '명령하지마라', views: '12.4만', body: '1. 게이지 70% 넘으면 무리하지 말고 가이드한테 붙어라  2. 빼지 말고 싸워 좀 쫄탱이ㅅㄲ들아' }
    }
  };

  /* ══════════════════════════════════════════════════════
     🔗 링크 허브 — 내 사이트 모음 (url만 바꿔 넣으면 돼요)
     img 에 이미지 주소를 넣으면 이모티콘 대신 그 이미지가 나와요 (정사각형 추천)
     ══════════════════════════════════════════════════════ */
  window.SY_HUB = [
    { name: 'Syringe', sub: 'LUVINFO', url: 'https://syringe.luvinfo.me/', icon: '💉', img: 'assets/images/link-sy.png' },
    { name: 'PpLE VILLAGE', sub: 'LUVLOG · DATA HUB', url: 'https://p.luvlog.me/', icon: '💾', img: 'assets/images/link-p.png' },
    { name: 'Syringe', sub: 'LUVLOG · PURE × UXI', url: 'https://syringe.luvlog.me/', icon: '🤍', img: 'assets/images/link-pu.gif' },
    { name: 'Taming the Shadow', sub: 'LUVLOG · DAAN × SHADOW', url: 'https://daan.luvlog.me/', icon: '🏍️', img: 'assets/images/link-dd.gif' },
    { name: 'The Thirsty Thorn', sub: 'LUVLOG · KATO × RIPPLE', url: 'https://kato.luvlog.me/', icon: '🌿', img: 'assets/images/link-kn.gif' }
  ];
