import { WormSkin, Achievement } from '../types/game';

export const GRID_COLS = 26;
export const GRID_ROWS = 22;
export const CELL_SIZE = 24; // Canvas logical unit size

export const BASE_SPEED_MS = {
  easy: 150,
  normal: 120,
  hard: 85,
};

export const SKINS: WormSkin[] = [
  {
    id: 'emerald',
    name: '초록 꿈틀이 (Classic)',
    desc: '싱그럽고 활기찬 클래식 에메랄드 지렁이',
    headColor: '#10B981', // emerald-500
    bodyColorStart: '#34D399', // emerald-400
    bodyColorEnd: '#059669', // emerald-600
    eyeColor: '#FFFFFF',
    pupilColor: '#064E3B',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    pattern: 'dots',
  },
  {
    id: 'cyber',
    name: '네온 사이버 (Cyberpunk)',
    desc: '빛나는 시안과 마젠타 네온 라인',
    headColor: '#06B6D4', // cyan-500
    bodyColorStart: '#22D3EE',
    bodyColorEnd: '#3B82F6',
    eyeColor: '#FDF4FF',
    pupilColor: '#0E7490',
    glowColor: 'rgba(6, 182, 212, 0.6)',
    pattern: 'neon',
  },
  {
    id: 'dragon',
    name: '황금 용 (Golden Drake)',
    desc: '찬란한 금빛 비늘과 루비 안광',
    headColor: '#F59E0B', // amber-500
    bodyColorStart: '#FBBF24',
    bodyColorEnd: '#D97706',
    eyeColor: '#FEF3C7',
    pupilColor: '#78350F',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    pattern: 'scales',
  },
  {
    id: 'gummy',
    name: '달콤 젤리 (Gummy Worm)',
    desc: '말랑말랑 분홍빛 복숭아 젤리 지렁이',
    headColor: '#EC4899', // pink-500
    bodyColorStart: '#F472B6',
    bodyColorEnd: '#DB2777',
    eyeColor: '#FFF1F2',
    pupilColor: '#831843',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    pattern: 'stripes',
  },
  {
    id: 'galaxy',
    name: '우주 스타더스트 (Galaxy)',
    desc: '신비로운 보랏빛 우주와 반짝이는 별무리',
    headColor: '#8B5CF6', // purple-500
    bodyColorStart: '#A78BFA',
    bodyColorEnd: '#6D28D9',
    eyeColor: '#EDE9FE',
    pupilColor: '#2E1065',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    pattern: 'stars',
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_bite',
    title: '첫 입맛',
    desc: '처음으로 맛있는 빨간 사과를 먹었습니다.',
    icon: '🍎',
    unlocked: false,
  },
  {
    id: 'growth_spurt',
    title: '쑥쑥 자란다',
    desc: '지렁이 길이가 20칸에 도달했습니다.',
    icon: '📏',
    unlocked: false,
  },
  {
    id: 'giant_worm',
    title: '대형 지렁이',
    desc: '지렁이 길이가 40칸에 도달했습니다.',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'combo_king',
    title: '콤보의 제왕',
    desc: '연속 5회 이상 콤보를 달성했습니다.',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'golden_feast',
    title: '황금빛 미식가',
    desc: '특별한 황금 사과를 3개 이상 먹었습니다.',
    icon: '⭐',
    unlocked: false,
  },
  {
    id: 'arcade_master',
    title: '아이템 수집가',
    desc: '아케이드 파워업 아이템을 5개 획득했습니다.',
    icon: '🧲',
    unlocked: false,
  },
  {
    id: 'rival_hunter',
    title: '라이벌 제압',
    desc: 'AI 지렁이 대전 모드에서 승리했습니다.',
    icon: '⚔️',
    unlocked: false,
  },
  {
    id: 'score_1000',
    title: '밀레니엄 스코어',
    desc: '한 게임에서 1,000점 이상 기록했습니다.',
    icon: '🏆',
    unlocked: false,
  },
];
