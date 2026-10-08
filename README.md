# 튼튼바퀴! 식품구성자전거 — 수정판 v2

## 이 저장소에서 수정하기

실행용 index.html은 최상단에 있습니다. dist/의 소스를 수정한 뒤 `node make-portable.mjs`를 실행하면 최상단 index.html과 오프라인 HTML을 함께 재생성합니다. GitHub Desktop에서 Commit 후 Push origin으로 반영하세요.

## 실행과 GitHub 업로드

`튼튼바퀴_게임.html`은 모든 이미지와 코드를 포함합니다. 브라우저로 직접 열면 설치·로그인·인터넷 없이 실행합니다.

폴더형 게임은 Node.js가 있는 PC에서 `node server.mjs` 실행 후 `http://127.0.0.1:4173`으로 엽니다. `dist/` 안의 내용을 정적 웹 서버에 올려도 됩니다.

`깃허브업로드_v2.zip`은 게시용 파일만 포함합니다. 압축을 푼 **내용을 저장소 폴더에 바로 복사**해 기존 파일을 교체하세요. 저장소 최상단에 index.html, style.css, JavaScript 파일과 assets 폴더가 있어야 합니다. .nojekyll도 포함합니다.

GitHub Desktop: 해당 저장소 → Changes 확인 → Summary 입력 → Commit to main → Push origin. GitHub Pages가 이미 main/root에 연결돼 있으면 새 버전이 게시됩니다. 최초 게시 시 저장소 웹페이지 Settings → Pages → Deploy from a branch → main → /(root) → Save.

한 파일형으로 올릴 때는 `튼튼바퀴_게임.html`을 복사해 `index.html`로 이름을 바꾸고 기존 파일을 교체합니다.

## v2 변경과 조작

- 트랙 어디에서든 위아래 드래그합니다. PC는 ↑·↓, 스페이스는 일시정지입니다.
- **앞바퀴 아래 연한 테두리를 음식의 그림자에 맞추면 획득**합니다. 탑승자 높이에 닿는 것만으로는 획득하지 않습니다.
- 두 바퀴의 타이어 아래쪽이 같은 접지면에 닿습니다. 뒷바퀴 변형·회전·수분 부족으로 앞바퀴가 주저앉아도 접지면을 유지합니다. 프레임의 바퀴 연결점도 함께 반영합니다.
- 음식은 고정 두 줄 없이 도로 전체에 연속 배치하고, 앞뒤 간격도 달리합니다. 자유 상하 조작을 유지합니다.
- 음식은 천천히, 도로와 가까운 풍경은 빠르게 흐릅니다. 도로 이동은 음식의 **4.75배**입니다. 산·나무·울타리·전경은 각각 다른 속도로 지나가고, 바퀴·페달·바람 선·먼지는 실제 주행 속도에 연결됩니다.
- 음식 20종을 **96×96 SVG 그림**으로 다시 만들고 짧은 이름표를 붙였습니다. 물은 물컵으로 표현합니다. 상한 음식에는 곰팡이와 빨간 X 표시가 있습니다. Canvas는 1280×720 이상이며 화면과 기기 픽셀 밀도를 반영합니다. 캐릭터와 풍경의 도트는 별도로 유지합니다.

## 규칙과 기본값

60초 안에 거리 **1,100** 완주가 목표입니다. 연속 음식 배치와 획득 위치 변경에 맞춰 1,050에서 조정했습니다. 균형 선택 모델 시뮬레이션 20개 시드에서 **42.4~44.6초**에 완주했습니다. 곡류와 물만 섭취하는 통제 시뮬레이션은 시간 초과했습니다. 실제 학생 플레이 난이도 평가는 별도입니다.

최근 20초의 다섯 식품군 목표는 3·2·3·2·2이며, 초과 기록도 치우침에 포함합니다. 결과는 한 판 전체 기록을 사용합니다. 게임 수치는 실제 영양 권장량이 아닙니다.

수분은 75에서 시작해 초당 3 감소, 물은 30 회복합니다. 간식은 최근 20초에 0~2개 무감속, 3개부터 감속합니다. 상한 음식은 즉시 3초간 0.65배 감속하고 연속 충돌은 종료 시각을 갱신합니다. 나쁜 상태에서도 최소 속도를 유지합니다.

표시 최대 100km/h, 정수 표시 70km/h에서 고속 자세, 65km/h 이하에서 복귀합니다. 골인 순간 70km/h 이상이면 원본 질주 → 만세 골인 → 결과 순서로 표시합니다. 탭 숨김·회전·포커스 이탈은 시간·기록 만료·감속·엔딩을 멈춥니다.

## 수정 위치

| 파일 | 내용 |
| --- | --- |
| dist/config.js | 난이도·배경별 이동 배율·음식·획득 위치·바퀴·엔딩 설정 |
| dist/geometry.js | 회전·변형에 따른 바퀴 접지면과 중심 좌표 |
| dist/foods.js | 음식 이름·종류·짧은 이름표·SVG 경로 |
| dist/model.js | 최근 기록·상태 계산·배치·획득·완주 스냅샷 |
| dist/render.js | 배경·프레임·바퀴·음식·이름표·속도계 |
| dist/app.js | 입력·일시정지·결과·엔딩 |
| dist/assets/sprites/ | 160×160 셀의 4열×2행 투명 atlas와 manifest |
| dist/assets/icons/*.svg | 실제 사용되는 20종 음식 그림 |
| dist/assets/endings/ | 내용 변경 없는 첨부 원본 두 장 |
| tools/build-icons.py | SVG 음식 재생성 |
| tools/build-assets.py | 저장된 생성 시트에서 탑승자 atlas 재구성 |

스프라이트의 공통 손은 [126,85], 크랭크는 [86,126]입니다. 바퀴는 분리돼 geometry.js에서 계산됩니다. manifest의 ground와 바퀴 좌표는 캐릭터 셀 기준이며, 자전거 부분은 셀 밖일 수 있습니다.

변경 후 `node make-portable.mjs`로 단일 HTML을 다시 만듭니다. `node --test tests/model.test.mjs tests/ui-state.test.mjs`로 검증합니다. SVG 생성기는 Python 표준 라이브러리만 필요합니다. 탑승자 atlas 재구성에는 Python/Pillow가 필요합니다.

탑승자 상체는 내장 ImageGen으로 제작했습니다. 기본 프롬프트: “Same Korean kitchen worker cycling RIGHT; pink uniform/apron, white sleeve protectors/mask/sanitary cap with pink visor, navy trousers; top row seated four phases, bottom row standing sprint four phases; no bicycle/wheels/text/background, crisp pixel art.” 생성 시트는 sources/rider-generated.png에 있으며, 손 기준점 정렬과 정확한 페달 다리 패킹은 코드로 수행했습니다. v2 음식은 코드 기반 SVG 에셋입니다.

미리보기 PNG/GIF는 실제 게임 렌더러를 네이티브 Canvas로 실행한 결과이며, 브라우저나 실제 스마트폰 캡처가 아닙니다. 자세한 검증 범위는 검증결과.md에 기록했습니다.
