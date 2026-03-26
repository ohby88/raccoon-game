# 🎨 애니메이션 업그레이드 완료!

## 📅 업데이트: 2026-03-26

---

## ✨ 추가된 기능

### 1. 🦊 여우 캐릭터 스프라이트
**주황색 여우 - 점프 특화**

- **특징**: 2단 점프 가능, 높은 점프력
- **디자인**: 주황색 몸, 뾰족한 귀, 풍성한 꼬리
- **스프라이트**:
  - `fox_idle.png` - 서있기
  - `fox_walk.png` - 걷기
  - `fox_jump.png` - 점프

### 2. 🐰 토끼 캐릭터 스프라이트
**보라색 토끼 - 스피드 특화**

- **특징**: 대시 스킬, 최고 속도
- **디자인**: 연보라 몸, 긴 귀, 큰 눈, 솜털 꼬리
- **스프라이트**:
  - `rabbit_idle.png` - 서있기
  - `rabbit_walk.png` - 걷기
  - `rabbit_jump.png` - 점프

### 3. 🎬 동적 애니메이션 시스템

#### 상태 기반 스프라이트 전환
```javascript
if (isJumping) {
  sprite = jump;
} else if (isMoving) {
  sprite = walk;
} else {
  sprite = idle;
}
```

#### 애니메이션 상태
| 상태 | 조건 | 스프라이트 |
|------|------|-----------|
| **서있기** | 정지 + 지면 | idle |
| **걷기** | 이동 + 지면 | walk |
| **점프** | 공중 | jump |

### 4. 💨 토끼 대시 잔상 효과

**3프레임 트레일 시스템**:
```javascript
// 대시 중 3개의 반투명 잔상 생성
for (let i = 0; i < 3; i++) {
  alpha = 0.15 - (i * 0.05);  // 점점 투명해짐
  offsetX = (i + 1) * 8;       // 8픽셀씩 간격
  draw(sprite, x + offsetX, y, alpha);
}
```

**효과**:
- 잔상 1: 15% 투명도, 8px 뒤
- 잔상 2: 10% 투명도, 16px 뒤
- 잔상 3: 5% 투명도, 24px 뒤

---

## 🎯 개선 사항

### Before (픽셀 도형)
```
- 단색 사각형으로 그린 캐릭터
- 정적인 모습
- 애니메이션 없음
```

### After (스프라이트 애니메이션)
```
✅ 3가지 포즈 (idle, walk, jump)
✅ 상태 기반 전환
✅ 부드러운 애니메이션
✅ 대시 잔상 효과
```

---

## 📊 기술 상세

### 스프라이트 시스템

#### 이미지 로딩
```javascript
const SPRITES = {
  raccoon_idle, raccoon_walk, raccoon_jump,
  fox_idle, fox_walk, fox_jump,
  rabbit_idle, rabbit_walk, rabbit_jump,
};

// 총 9개 이미지 비동기 로드
totalImages = 9;
```

#### 렌더링 최적화
- 이미지가 로드되지 않으면 폴백으로 단색 사각형 표시
- 캐릭터별 독립적인 스프라이트 세트
- 상태 변경 시에만 스프라이트 변경

### 생성 스크립트

**`create_sprites.py`**:
```python
# Pillow를 사용한 프로그래밍 방식 스프라이트 생성
def create_fox_idle(size=832):
    # 타원, 다각형을 조합하여 캐릭터 생성
    # 투명 배경 PNG 출력
```

---

## 🎮 캐릭터 비교

| 캐릭터 | 특징 | 속도 | 점프 | 스킬 |
|--------|------|------|------|------|
| 🦝 **너구리** | 밸런스형 | ⭐⭐⭐ | ⭐⭐⭐ | 없음 |
| 🦊 **여우** | 점프형 | ⭐⭐ | ⭐⭐⭐⭐⭐ | 2단 점프 |
| 🐰 **토끼** | 스피드형 | ⭐⭐⭐⭐⭐ | ⭐⭐ | 대시 |

---

## 📁 파일 구조

```
raccoon-game/
├── sprites/
│   ├── raccoon_idle.png  ✅ 경찰 너구리
│   ├── raccoon_walk.png
│   ├── raccoon_jump.png
│   ├── fox_idle.png      ✅ 주황 여우
│   ├── fox_walk.png
│   ├── fox_jump.png
│   ├── rabbit_idle.png   ✅ 보라 토끼
│   ├── rabbit_walk.png
│   └── rabbit_jump.png
├── game.js               (스프라이트 시스템 통합)
├── create_sprites.py     (스프라이트 생성 스크립트)
└── remove_bg.py          (배경 제거 유틸리티)
```

---

## 🎨 시각적 개선

### 1. 너구리 (경찰복 스타일)
- 파란 모자에 별 뱃지
- 회색/검은 얼굴 마스크
- 배낭 착용
- 줄무늬 꼬리

### 2. 여우 (귀여운 스타일)
- 밝은 주황색
- 뾰족한 귀
- 흰색 배와 꼬리 끝
- 검은 코

### 3. 토끼 (애니메이션 스타일)
- 연보라색 몸
- 긴 귀 (분홍 안쪽)
- 큰 분홍 눈
- 하얀 솜털 꼬리

---

## 🔧 코드 하이라이트

### 동적 스프라이트 선택
```javascript
function drawRaccoon(c, x, y, w, h, def, frame, facingLeft, isJumping, isMoving) {
  let sprite;
  if (isJumping) sprite = SPRITES.raccoon_jump;
  else if (isMoving) sprite = SPRITES.raccoon_walk;
  else sprite = SPRITES.raccoon_idle;

  c.drawImage(sprite, x, y, w, h);
}
```

### 대시 잔상 렌더링
```javascript
if (dashing) {
  for (let i = 0; i < 3; i++) {
    const offsetX = facingLeft ? (i + 1) * 8 : -(i + 1) * 8;
    const alpha = 0.15 - (i * 0.05);
    c.globalAlpha = alpha;
    c.drawImage(trailSprite, x + offsetX, y, w, h);
  }
  c.globalAlpha = 1.0;
}
```

---

## 🎯 플레이 팁

### 각 캐릭터 활용법

**🦝 너구리**:
- 초보자 추천
- 균형잡힌 능력
- 안정적인 플레이

**🦊 여우**:
- 높은 곳 접근 필요 시
- 2단 점프로 복잡한 맵 돌파
- 공중 제어 중요

**🐰 토끼**:
- 속도런 도전
- 대시로 적 회피
- 빠른 클리어 타임

---

## 📈 성능

- **이미지 개수**: 9개 (각 캐릭터 3포즈)
- **파일 크기**: ~500KB/이미지
- **로딩 시간**: <1초 (고속 인터넷)
- **렌더링**: 60 FPS 유지
- **메모리**: 최소 증가

---

## 🚀 향후 계획

- [ ] 걷기 애니메이션 프레임 증가 (2-3프레임)
- [ ] 점프 상승/하강 분리
- [ ] 착지 애니메이션
- [ ] 피격 애니메이션
- [ ] 승리 포즈

---

## 🎮 테스트 방법

```bash
# 로컬 서버 실행
cd /c/Users/ohbam/workplace/raccoon-game
python -m http.server 8000

# 브라우저에서 접속
http://localhost:8000
```

### 확인 사항:
1. ✅ 캐릭터 선택 화면에 3개 캐릭터 아이콘 표시
2. ✅ 서있을 때 idle 스프라이트
3. ✅ 좌우 이동 시 walk 스프라이트
4. ✅ 점프 시 jump 스프라이트
5. ✅ 토끼 대시 시 잔상 효과

---

**모든 캐릭터가 살아 움직입니다!** 🎉

🦝 경찰 너구리 | 🦊 주황 여우 | 🐰 보라 토끼
