# 🚀 외부 접속 가능한 배포 가이드

## 🌐 공개 URL로 배포하기

---

## 방법 1: GitHub Pages (무료, 추천 ✨)

### 자동 배포 (이미 설정됨!)

이 프로젝트는 이미 GitHub Actions가 설정되어 있습니다.

### 활성화 단계:

1. **GitHub 저장소 접속**:
   ```
   https://github.com/ohby88/raccoon-game
   ```

2. **Settings 탭 클릭**

3. **왼쪽 메뉴에서 Pages 클릭**

4. **Source 설정**:
   - Source: **GitHub Actions** 선택
   (또는 Branch: main, Folder: / (root))

5. **Save 클릭**

6. **상단에 표시되는 URL 확인**:
   ```
   https://ohby88.github.io/raccoon-game/
   ```

### 배포 확인:

- **Actions 탭**에서 배포 진행 상황 확인
- 초록색 체크 표시가 나타나면 배포 완료
- 약 2-5분 소요

---

## 방법 2: Vercel (가장 빠름 🔥)

### 1회 설정 (5분):

1. **Vercel 접속 및 로그인**:
   ```
   https://vercel.com
   ```
   - GitHub 계정으로 로그인

2. **New Project 클릭**

3. **Import Git Repository**:
   - `ohby88/raccoon-game` 검색 및 선택
   - Import 클릭

4. **Deploy 클릭** (설정 그대로 유지)

5. **배포 완료**:
   ```
   https://raccoon-game-xxx.vercel.app
   ```
   (xxx는 자동 생성됨)

### 장점:
- ✅ 즉시 배포 (2분)
- ✅ Git push 시 자동 재배포
- ✅ 프리뷰 URL 제공
- ✅ 무료

---

## 방법 3: Netlify (간단함 🎯)

### 드래그 앤 드롭 배포:

1. **Netlify 접속**:
   ```
   https://app.netlify.com/drop
   ```

2. **프로젝트 폴더를 드래그**:
   ```
   C:\Users\ohbam\workplace\raccoon-game
   ```

3. **배포 완료**:
   ```
   https://xxx.netlify.app
   ```

### Git 연동 (자동 배포):

1. **Netlify 로그인** (GitHub 계정)
2. **New site from Git**
3. **GitHub 선택**
4. **raccoon-game 선택**
5. **Deploy site**

---

## 📱 공개 URL 공유하기

### GitHub Pages URL:
```
https://ohby88.github.io/raccoon-game/
```

### QR 코드 생성:
```
https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://ohby88.github.io/raccoon-game/
```

### 짧은 URL 만들기:
- https://bit.ly
- https://tinyurl.com

---

## 🔍 배포 상태 확인

### GitHub Pages:

**Actions 탭에서 확인**:
```
https://github.com/ohby88/raccoon-game/actions
```

**배포 성공 시**:
- ✅ 초록색 체크 표시
- 🌐 공개 URL 활성화

**배포 실패 시**:
- ❌ 빨간색 X 표시
- 📋 에러 로그 확인

### 테스트 방법:

1. **PC 브라우저**에서 URL 접속
2. **핸드폰 브라우저**에서 URL 접속
3. **다른 사람에게 URL 전송**
4. **게임 플레이 테스트**

---

## 📊 배포 비교

| 방법 | 속도 | 자동화 | 커스텀 도메인 | 무료 |
|------|------|--------|---------------|------|
| **GitHub Pages** | ⭐⭐⭐ | ✅ | ✅ | ✅ |
| **Vercel** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ✅ |
| **Netlify** | ⭐⭐⭐⭐ | ✅ | ✅ | ✅ |

---

## 🎯 추천 워크플로우

### 개발 중:
```
로컬 서버 → http://localhost:8000
```

### 테스트 공유:
```
Vercel → https://raccoon-game-xxx.vercel.app
```

### 최종 배포:
```
GitHub Pages → https://ohby88.github.io/raccoon-game/
```

---

## 🐛 문제 해결

### GitHub Pages 404 오류:

**원인**: Pages가 아직 활성화 안 됨

**해결**:
1. Settings → Pages
2. Source 설정 확인
3. Actions 탭에서 배포 상태 확인
4. 5-10분 대기

### Vercel 배포 실패:

**원인**: 빌드 오류

**해결**:
1. Framework Preset: `Other` 선택
2. Build Command: 비워두기
3. Output Directory: `.`
4. Install Command: 비워두기

### Netlify 빈 페이지:

**원인**: index.html 경로 문제

**해결**:
1. 루트 폴더 전체를 드래그
2. `index.html`이 최상위에 있는지 확인

---

## ✅ 배포 체크리스트

배포 전 확인:

- [ ] `index.html` 파일이 루트에 있음
- [ ] `sprites/` 폴더가 있음
- [ ] `game.js` 파일이 있음
- [ ] Git 커밋 & 푸시 완료

배포 후 테스트:

- [ ] 공개 URL 접속 가능
- [ ] 게임 로딩 정상
- [ ] 캐릭터 선택 화면 표시
- [ ] 터치 컨트롤 작동 (모바일)
- [ ] 사운드 재생
- [ ] 게임 플레이 가능

---

## 🎮 테스트 시나리오

### 다른 사람에게 공유:

1. **URL 전송**:
   ```
   https://ohby88.github.io/raccoon-game/
   ```

2. **테스트 요청**:
   - 게임이 로딩되나요?
   - 터치 컨트롤이 작동하나요?
   - 플랫폼 통과 기능 (↓+점프) 작동하나요?
   - 사운드가 들리나요?

3. **피드백 수집**:
   - 버그 리포트
   - 성능 문제
   - 개선 제안

---

## 🔗 유용한 링크

### 프로젝트:
- **GitHub**: https://github.com/ohby88/raccoon-game
- **GitHub Pages**: https://ohby88.github.io/raccoon-game/

### 배포 플랫폼:
- **Vercel**: https://vercel.com
- **Netlify**: https://netlify.com
- **GitHub Pages Docs**: https://pages.github.com

---

## 📝 커스텀 도메인 (선택사항)

### GitHub Pages에 도메인 연결:

1. **도메인 구매** (예: raccoon-game.com)

2. **DNS 설정**:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
          185.199.109.153
          185.199.110.153
          185.199.111.153
   ```

3. **GitHub Settings → Pages**:
   - Custom domain: `raccoon-game.com`
   - Enforce HTTPS 체크

---

**지금 바로 GitHub Pages를 활성화하고 공개 URL을 받으세요!** 🚀

Settings → Pages → Source: GitHub Actions → Save
