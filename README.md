# Syringe — 깃허브 개인 홈

티스토리 스킨을 그대로 옮긴 개인 홈이에요. 글은 **관리자 화면(Pages CMS)** 에서 쓰고, 디자인은 코드 파일을 직접 고치면 돼요.

---

## 1. 처음 한 번만 하는 설정

### ① 저장소 만들기
1. GitHub 로그인 → 오른쪽 위 **＋ → New repository**
2. 이름 정하기
   - `내아이디.github.io` 로 만들면 주소가 **https://내아이디.github.io/**
   - 다른 이름(예: `syringe`)이면 주소가 **https://내아이디.github.io/syringe/**
   - 둘 다 그대로 작동해요.
3. **Public** 선택 → Create repository

### ② 파일 올리기
압축을 풀고, 안에 있는 **모든 파일과 폴더**를 저장소에 올려요.

- 웹에서: 저장소 첫 화면의 **uploading an existing file** → 폴더 안 내용을 전부 끌어다 놓기 → **Commit changes**
- 올린 뒤에 **`.github/workflows/deploy.yml`** 과 **`.pages.yml`** 이 저장소에 있는지 꼭 확인해요.
  점(.)으로 시작하는 파일이라 탐색기 설정에 따라 숨겨져서 빠질 수 있어요.
  빠졌으면 **Add file → Create new file** 에서 이름을 그대로 쓰고 내용을 붙여넣으면 돼요.

### ③ Pages 켜기
1. 저장소 **Settings → Pages**
2. **Build and deployment → Source** 를 **GitHub Actions** 로 바꾸기
3. 저장소 **Settings → Actions → General** 맨 아래 **Workflow permissions** 를 **Read and write permissions** 로 바꾸고 Save

### ④ 첫 배포
- 저장소 **Actions** 탭 → **사이트 배포** → **Run workflow** (또는 파일을 하나 고쳐서 저장하면 자동 실행)
- 초록 체크가 뜨면 끝이에요. 1~2분 뒤 주소로 들어가면 홈이 보여요.

### ⑤ 관리자 화면 연결
1. **https://app.pagescms.org** → **Sign in with GitHub**
2. 처음이면 GitHub App 설치 화면이 나와요 → 이 저장소만 선택해서 설치
3. 저장소를 고르면 왼쪽에 **글 (Records)** · **홈 설정** 이 보여요.

홈 오른쪽 위 **연필 버튼**과 시작 메뉴의 **글쓰기 · 관리자**가 이 관리자 화면으로 연결돼요.

---

## 2. 무엇을 어디서 고치나요

| 하고 싶은 것 | 어디서 |
|---|---|
| 글 쓰기 / 고치기 / 지우기 | 관리자 화면 → **글 (Records)** |
| 공지 올리기 | 글 쓸 때 **공지사항으로 올리기** 켜기 |
| 커미션 OPEN·CLOSE, 금액, 부제목 | 글 쓸 때 **커미션 상태 / 금액 / 부제목** 칸 |
| 임시저장 | 글 쓸 때 **임시저장** 켜기 (홈에 안 보임) |
| D+ 기준일, 타이틀 문구, 프로필 사진, D-DAY 사진·메모 | 관리자 화면 → **홈 설정** |
| 안내사항 창에 띄울 글 | 홈 설정 → **안내사항 창에 띄울 글** 에 글 파일 이름 (예: `2026-10-14-200000`) |
| 카테고리 (Records 창 목록) | 홈 설정 → **카테고리** + `.pages.yml` 의 category 목록 (두 군데) |
| 플레이리스트 · 메신저 대사 · 알림 문구 · 인터넷 · 링크 허브 | `assets/js/config.js` (코드로 직접) |
| 디자인 (색·배치·크기) | `assets/css/style.css` |
| 화면 구조 (창, 아이콘, 문구) | `index.html` |
| 이웃 배너 | `index.html` 에서 `Neighbors` 검색 |

> 글을 저장하면 GitHub Actions 가 글 목록(`posts/posts.json`)을 자동으로 다시 만들고 사이트에 올려요. 1~2분 걸려요.

---

## 3. 이미지 · 음악

- 저장소 `assets/images/` 에 파일을 올리고, `config.js` 에서 `'assets/images/파일이름.mp3'` 처럼 쓰면 돼요.
- 파일 이름에는 **띄어쓰기 대신 `-`** 를 쓰세요. (예: `Love-Disorder.mp3`)
- 웹 업로드는 파일 하나에 25MB 까지예요.
- 관리자 화면에서 글에 넣는 이미지는 자동으로 `assets/uploads/` 에 저장돼요.

**꼭 옮겨 두세요:** 지금 `config.js` 의 앨범 커버, `index.html` 의 이웃 배너 이미지 중 `blog.kakaocdn.net` / `img1.daumcdn.net` 주소는 티스토리에 올렸던 이미지라 **유효기간(expires)** 이 붙어 있어요. 언젠가 안 보이게 되니까, 이미지를 내려받아 `assets/images/` 에 넣고 주소를 바꿔 두는 게 안전해요.

---

## 4. 글은 창으로 열려요

글 카드를 누르면 페이지가 바뀌지 않고, 홈 화면 안에 **글 창**이 떠요. 하단바에 글 제목이 탭으로 생기고, 여러 글을 동시에 열 수 있어요 (최대 5개).
Records 창에서 폴더를 누르면 **목록 창**에 그 폴더의 글 카드가 떠요. 모바일에서는 아래에서 올라오는 시트로 열려요.

글 창의 공유 버튼으로 복사한 링크로 들어오면, 홈이 열리면서 그 글 창이 바로 떠요.

| 링크 | 열리는 창 |
|---|---|
| `?p=글파일이름` | 그 글 |
| `?c=PURE` | PURE 폴더 목록 |
| `?c=` | 전체 기록 목록 |
| `?notice` | 공지 목록 |

## 5. 내 컴퓨터에서 미리보기 (피닉스코드)

- 이 폴더를 피닉스코드로 열고 `index.html` 을 실시간 미리보기 하면 그대로 보여요.
- 글 목록은 `posts/posts.json` 을 읽어요. 새 글은 깃허브에 올라간 뒤 자동으로 갱신된 파일을 받아오면(Pull) 보여요.
- `index.html` 을 더블클릭해서 바로 열면(file://) 설정·글을 못 불러와요. 꼭 미리보기(로컬 서버)로 열어요.

---

## 6. 파일 구성

```
index.html                  화면 전체 (홈 + 모든 창)
settings.json               홈 설정 (관리자 화면에서 고침)
posts/                      글 (관리자 화면에서 고침)
  posts.json                글 목록 — 자동 생성, 직접 고치지 않기
assets/css/style.css        디자인
assets/js/config.js         플레이리스트 · 메신저 · 알림 · 인터넷 · 링크 허브
assets/js/site.js           글 목록·글 보기 · 창 관리 · 시계
assets/js/apps.js           커버 · 알림 · 메신저 · 메드킷 · 플레이어 등 앱
assets/js/fx.js             클릭 반짝 + 효과음 (지우면 꺼짐)
assets/images/              커서 · 음악 · 내 이미지
assets/uploads/             관리자 화면에서 올린 이미지
tools/build_posts.py        글 목록 만드는 스크립트 (Actions 가 실행)
.github/workflows/deploy.yml  자동 배포
.pages.yml                  관리자 화면 설정
```
