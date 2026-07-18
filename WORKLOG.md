# 사랑나라 작업일지

> 피아노를 쳐서 사랑나라를 예쁘게 만드는 웹 게임 (PWA)

## 배포 정보
- **저장소**: https://github.com/SYA-Apps/sarangnara (public)
- **게임 주소**: https://sya-apps.github.io/sarangnara/
- **로컬 폴더**: `C:\SYA\Sarangnara\sarangnara-web`
- **현재 버전**: `sw.js` VER `sarangnara-v10`
- 커밋 작성자: `SYA <sya@noreply.invalid>` (reading-log 등 다른 프로젝트와 동일)

## 배포 방법 (파일 고친 뒤)
```
git add -A
git commit -m "무엇을 바꿨는지"
git push
```
- push 하면 1~2분 뒤 자동으로 사이트 반영
- **게임을 고칠 때마다 `sw.js` 의 `const VER = 'sarangnara-vN'` 숫자를 1 올릴 것** (안 올리면 폰 캐시가 갱신 안 됨)

## 2026-07-18~19 완료한 것
1. ✅ git 초기화 + GitHub(SYA-Apps/sarangnara) 배포 + Pages 활성화
2. ✅ **글씨체 깨짐 수정** — Gaegu·Gothic A1 폰트를 흔한 한글 전체로 재-subset,
   인라인 base64 → `fonts/*.woff2` 외부 파일로 분리 (index.html 447KB→약 128KB)
3. ✅ **인트로/엔딩 배경음악** — 이미 작곡돼 있던 BGM이 트리거 안 되던 것 수정,
   볼륨 상향(화음 .04 / 멜로디 .075), 첫 터치에 재생 + 오디오 깨어나는 즉시 재시도(v9)
4. ✅ **회전 시 크래시 수정** — renderSystem 에서 곡 끝난 뒤 si 범위 벗어나면 방어
5. ✅ **8분음표 깃발 안 보이던 버그** — 지도 마커용 `.flag` CSS 와 음표 깃발 클래스
   충돌 → 음표 깃발을 `.nflag` 로 분리
6. ✅ **비행기 리듬** — 사용자 악보대로 교정 (떴~다 점4분+8분, 소절끝 2분음표, 끝 온음표)
7. ✅ **등대지기 · 즐거운 나의 집** — 사용자가 zip으로 준 완성 악보 데이터로 교체
   (비행기·폰트·기타 수정본은 유지하고 이 두 곡 notes 만 교체)
8. ✅ **iOS 사파리 더블탭 확대 방지** — 빠르게 칠 때 화면 확대되던 것,
   350ms 이내 연속 touchend 확대동작 취소 + gesturestart 등 핀치 확대 차단 (버튼은 예외)

## 내일 확인/할 일
- [ ] **폰 캐시 갱신 확인**: 사용자가 v10을 아직 못 받고 옛 버전 봄.
      → 앱 완전히 닫았다 열기, 또는 사파리에서 새로고침 2~3번 하면 v10 반영됨.
      (서버엔 v10 정상 배포 확인 완료)
- [ ] (선택) **서비스워커를 network-first 로 개선** — 지금은 cache-first(stale-while-revalidate)
      라 새 버전이 뜨려면 새로고침을 2번 해야 함. index.html/sw.js 를 network-first 로
      바꾸면 온라인일 때 한 번에 최신본이 뜸(오프라인은 캐시 폴백). 사용자 편의 개선.
- [ ] 등대지기·즐거운 나의 집 실제로 쳐보고 리듬/음 최종 확인
- [ ] (원할 경우) 타이틀에 "화면을 톡 누르면 시작! 🎵" 안내 → 첫 터치 자연 유도

## 참고 (기술 메모)
- 곡 데이터: `index.html` 안 `const SONGS=[...]` 배열. 각 곡 `notes:[['음이름',박],...]`,
  쉼표는 `['R',박]`. `sig:[분자,분모]`, `pickup`(못갖춘마디 박), `perSystem`(한 줄 마디수).
- 6/8은 한 마디 3.0박(8분음표 6개), 4/4는 4.0박. buildMeasures 가 박 합으로 마디를 나눔.
- 폰트 재-subset 스크립트/방법은 세션 스크래치패드에 있었음(원본 구글폰트에서 재생성).
- 악보를 이미지로 확인시켜줄 때: 게임의 drawNote/drawBeams 로직을 그대로 옮긴
  Node 스크립트로 SVG 생성해서 보여줌.
