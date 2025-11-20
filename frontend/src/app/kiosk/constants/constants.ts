import type { Program, Facility } from '../types/types';

// ✅ DB 형식에 맞춘 프로그램 (참고용, 실제로는 안 씀)
export const YOUTH_PROGRAMS: Program[] = [
  {
    id: 1,
    title: '모의창업학교 "주니어 CEO"',
    description: '아이디어를 비즈니스 모델로 발전시키고, 실제 창업 과정을 경험해보는 프로그램입니다.',
    department: '교육/진로',
    fee: 0,
  },
  {
    id: 2,
    title: 'AI 4차산업 페스티벌',
    description: 'AI, 로봇, 드론 등 4차 산업혁명 기술을 직접 체험하고 미래 기술 트렌드를 알아보는 축제입니다.',
    department: '기술/과학',
    fee: 0,
  },
  {
    id: 3,
    title: '패밀리데이 "가족 소풍"',
    description: '다양한 레크레이션과 체험 활동을 통해 가족과 함께 즐거운 추억을 만드는 날입니다.',
    department: '가족/체험',
    fee: 0,
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
];