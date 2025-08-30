# 동료를 찾는 가장 빠른 선택, peer

<div align="center">
  <a href="https://yoouyeon.notion.site/peer-web-application">🐳 서비스 소개글</a> | <a href="https://drive.google.com/file/d/1yPsjwCqVCJryq3sThUn4MguhNuakDRFa/view?usp=drive_link">🐋 개발 백서</a>
  <br/><br/>
  <img src="https://img.shields.io/coderabbit/prs/github/yoouyeon/Peer-Frontend?utm_source=oss&utm_medium=github&utm_campaign=yoouyeon%2FPeer-Frontend&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews" alt="CodeRabbit Pull Request Reviews" />
</div>

---

<img width="100%" alt="image" src="https://github.com/user-attachments/assets/f8a1241c-1698-49b8-985c-8280236ead83" />

## 🚩 Table of Contents

- [🚀 실행 방법](#-실행-방법)
- [🏗️ 프로젝트 구조](#%EF%B8%8F-프로젝트-구조)
- [🪐 팀원 소개](#-팀원-소개)
- [📑 프로젝트 문서](#-프로젝트-문서)

## 🚀 실행 방법

### 로컬 실행

```bash
git clone https://github.com/yoouyeon/Peer-Frontend.git
cd Peer-Frontend
nvm use
npm install
npm run dev
```

### 테스트 계정

회원 기능을 실행하기 위한 테스트 계정입니다.

- 예시 ID: `test@example.com`
- 예시 PW: `Password123!`

### API 안내

이 프로젝트는 실제 서버와 연동되지 않으며, MSW를 활용하여 모킹한 API 응답을 활용하고 있습니다.

따라서 API를 통해 요청한 데이터와 실제 응답이 다를 수 있습니다.

## 🏗️ 프로젝트 구조

### 기술스택

|   Category    | Stack                                                                                                                                                                                                                                                                            |
| :-----------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   **코어**    | ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)                |
| **상태 관리** | ![Zustand](https://img.shields.io/badge/Zustand-764ABC?logo=zustand&logoColor=white) ![SWR](https://img.shields.io/badge/SWR-000000?logo=vercel&logoColor=white)                                                                                                                 |
| **스타일링**  | ![MUI](https://img.shields.io/badge/MUI-007FFF?logo=mui&logoColor=white)                                                                                                                                                                                                         |
|  **테스트**   | ![Jest](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white) ![Testing Library](https://img.shields.io/badge/Testing%20Library-E33332?logo=testinglibrary&logoColor=white) ![MSW](https://img.shields.io/badge/MSW-FF6A33?logo=mockserviceworker&logoColor=white) |
|   **CI/CD**   | ![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)                                                                                                                                                                       |

### 아키텍쳐

<img width="100%" alt="image" src="https://github.com/user-attachments/assets/4d34ba7b-eb4d-4851-9266-0c29e8e1d4c2" />

## 🪐 팀원 소개

### 프론트엔드

| 이름   | 담당 영역                                      |
| ------ | ---------------------------------------------- |
| 전준성 | 팀 등록, 어드민 페이지                         |
| 임호성 | 검색, 팀페이지                                 |
| 김우림 | 로그인, DnD 레이아웃                           |
| 윤정연 | 쪽지, 팀페이지 게시판, 팀페이지 DnD 위젯       |
| 김현지 | 메인페이지, 모집글, DnD 레이아웃               |
| 나현   | 디자인시스템(공통컴포넌트), 프로필, 히치하이킹 |
| 정현섭 | 쇼케이스, 쪽지                                 |

### 백엔드

| 이름   | 담당 영역           |
| ------ | ------------------- |
| 류한솔 | 알림 및 소켓        |
| 송준상 | 회원, 팀 정보       |
| 이주현 | 회원 및 프로필 정보 |
| 김형찬 | 어드민, 사용자 추적 |
| 위지혜 | 게시판 및 파일 정보 |
| 채우석 | 알림 및 게시판      |

### 기획

- 류한솔, 위지혜, 임호성

### 디자인

- UI/UX, 디자인 시스템 : 이보람, 양채윤
- 책자 디자인 : 조하연

## 📑 프로젝트 문서

- [기능 정의서](https://docs.google.com/spreadsheets/d/1hV6dizSpFn_dMCbVjFT59eQy7oTNmfK59LVYpfmYhAo/edit?usp=sharing)
- [세부 기획 정의서](https://docs.google.com/spreadsheets/d/1Dq1gftt09NmDohKkpLfPB9RuKYkbsOXc_iIj7t4yZiM/edit?usp=sharing)
- [프로토 타입](https://www.figma.com/file/St064d90S4S7KJU33gjtzO/Peer-Design?type=design&node-id=4297%3A20043&mode=design&t=UqlnjVT9yWuMNCyQ-1)
- [와이어프레임](https://www.figma.com/file/St064d90S4S7KJU33gjtzO/Peer-Design?type=design&node-id=170%3A9803&mode=design&t=UqlnjVT9yWuMNCyQ-1)
- [세부 디자인](https://www.figma.com/file/St064d90S4S7KJU33gjtzO/Peer-Design?type=design&node-id=1%3A255&mode=design&t=UqlnjVT9yWuMNCyQ-1)
