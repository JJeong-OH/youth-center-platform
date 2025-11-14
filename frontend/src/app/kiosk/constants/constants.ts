import type { Program, Facility } from '../types/types';

export const YOUTH_PROGRAMS: Program[] = [
  {
    id: 'prog_001',
    name: '모의창업학교 "주니어 CEO"',
    description: '아이디어를 비즈니스 모델로 발전시키고, 실제 창업 과정을 경험해보는 프로그램입니다.',
    category: '교육/진로',
  },
  {
    id: 'prog_002',
    name: 'AI 4차산업 페스티벌',
    description: 'AI, 로봇, 드론 등 4차 산업혁명 기술을 직접 체험하고 미래 기술 트렌드를 알아보는 축제입니다.',
    category: '기술/과학',
  },
  {
    id: 'prog_003',
    name: '패밀리데이 "가족 소풍"',
    description: '다양한 레크레이션과 체험 활동을 통해 가족과 함께 즐거운 추억을 만드는 날입니다.',
    category: '가족/체험',
  },
  {
    id: 'prog_004',
    name: '가족 컬러푸드 테라피',
    description: '오감을 자극하는 컬러푸드를 이용해 요리하고, 가족의 마음 건강을 챙기는 힐링 프로그램입니다.',
    category: '가족/요리',
  },
  {
    id: 'prog_005',
    name: '비행가족 "드론 마스터"',
    description: '드론 조종법을 배우고, 가족과 함께 드론 레이싱 및 항공 촬영을 즐기는 프로그램입니다.',
    category: '기술/가족',
  },
  {
    id: 'prog_006',
    name: 'AI 미디어랩 기획단',
    description: 'AI를 활용한 영상, 음악 등 미디어 콘텐츠를 직접 기획하고 제작하는 청소년 리더 그룹입니다.',
    category: '미디어/기술',
  },
  {
    id: 'prog_007',
    name: '환경을 코딩하다',
    description: '환경 문제를 코딩으로 해결하는 방법을 배우고, 환경 보호를 위한 앱이나 게임을 개발합니다.',
    category: '코딩/환경',
  },
  {
    id: 'prog_008',
    name: 'GPT 친구들',
    description: '최신 AI 언어 모델인 GPT를 활용하여 나만의 챗봇을 만들고 AI와 소통하는 법을 배웁니다.',
    category: '코딩/기술',
  },
  {
    id: 'prog_009',
    name: '청소년 자율공간 "아지트"',
    description: '청소년들이 자유롭게 와서 쉬고, 공부하고, 친구들과 교류하며 원하는 활동을 할 수 있는 공간입니다.',
    category: '공간/커뮤니티',
  },
  {
    id: 'prog_010',
    name: '평생교육 프로그램',
    description: '청소년뿐만 아니라 모든 세대가 참여할 수 있는 인문학, 외국어 등 다양한 강좌를 제공합니다.',
    category: '교육/교양',
  },
  {
    id: 'prog_011',
    name: '도그홀릭 "반려견 문화교실"',
    description: '반려견 행동 교육, 펫 아로마 테라피 등 올바른 반려문화를 배우고 교감하는 시간입니다.',
    category: '취미/동물',
  },
  {
    id: 'prog_012',
    name: '원데이 클래스',
    description: '베이킹, 가죽 공예, 플라워 아트 등 매주 새로운 주제로 열리는 일일 체험 강좌입니다.',
    category: '취미/예술',
  },
];

export const YOUTH_FACILITIES: Facility[] = [
  {
    id: 'fac_001',
    name: '댄스연습실',
    description: '전면 거울과 블루투스 스피커가 완비되어 있어 안무 연습에 최적화된 공간입니다.',
    capacity: 12,
    image: 'https://picsum.photos/seed/dance_studio/600/400',
  },
  {
    id: 'fac_002',
    name: 'AI체험실',
    description: '최신 AI 기술과 VR/AR 장비를 통해 미래 기술을 직접 체험하고 학습할 수 있는 공간입니다.',
    capacity: 8,
    image: 'https://picsum.photos/seed/ai_experience/600/400',
  },
  {
    id: 'fac_003',
    name: '파티룸',
    description: '친구들과 함께 보드게임을 즐기거나 소규모 파티를 열 수 있는 아늑한 공간입니다.',
    capacity: 5,
    image: 'https://picsum.photos/seed/party_room/600/400',
  },
  {
    id: 'fac_004',
    name: '멀티실',
    description: '빔 프로젝터와 스크린이 구비되어 있어 영화 감상, 프레젠테이션 연습 등 다양하게 활용 가능합니다.',
    capacity: 20,
    image: 'https://picsum.photos/seed/multi_room/600/400',
  },
  {
    id: 'fac_005',
    name: '다목적소강당',
    description: '소규모 공연, 발표회, 강연 등을 진행할 수 있는 무대와 객석을 갖춘 공간입니다.',
    capacity: 30,
    image: 'https://picsum.photos/seed/small_hall/600/400',
  },
  {
    id: 'fac_006',
    name: '특성화실',
    description: '유튜브 촬영, 팟캐스트 녹음 등 미디어 콘텐츠 제작을 위한 전문 장비가 마련된 공간입니다.',
    capacity: 15,
    image: 'https://picsum.photos/seed/special_room/600/400',
  },
  {
    id: 'fac_007',
    name: '중강당',
    description: '워크숍, 세미나, 중규모 행사 등 다인원이 참여하는 활동을 위한 넓고 쾌적한 강당입니다.',
    capacity: 50,
    image: 'https://picsum.photos/seed/main_hall/600/400',
  },
];
