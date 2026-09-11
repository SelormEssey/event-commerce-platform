import { prototypeEvents } from '../../events/fixtures/events';
import { money } from '../../events/money';
import type { PromotionRecord } from '../domain';

function promotionId(index: number) {
  return `00000000-0000-4000-8501-${index.toString().padStart(12, '0')}`;
}

const [afterglow, , , goldenHour, , , nights] = prototypeEvents;
if (!afterglow || !goldenHour || !nights) {
  throw new Error('Required prototype events are missing.');
}

export const prototypePromotions = [
  {
    id: promotionId(1),
    eventId: afterglow.id,
    code: 'SAVE20',
    name: 'Prototype launch offer',
    type: 'PERCENTAGE',
    percentageBasisPoints: 2000,
    startsAt: '2026-09-01T00:00:00.000Z',
    endsAt: '2027-01-15T23:00:00.000Z',
    usageLimit: 50,
    isActive: true,
    attributionLabel: 'Prototype street team',
    ticketTierIds: [],
  },
  {
    id: promotionId(2),
    eventId: afterglow.id,
    code: 'ROOM10',
    name: 'Room-list test',
    type: 'FIXED_AMOUNT',
    fixedAmount: money('1000', 'SLE'),
    startsAt: '2026-10-01T00:00:00.000Z',
    endsAt: '2027-01-15T23:00:00.000Z',
    isActive: false,
    ticketTierIds: [afterglow.ticketTiers[1]?.id ?? ''],
  },
  {
    id: promotionId(3),
    eventId: goldenHour.id,
    code: 'ACCRA15',
    name: 'Prototype community offer',
    type: 'PERCENTAGE',
    percentageBasisPoints: 1500,
    startsAt: '2026-09-01T00:00:00.000Z',
    endsAt: '2027-01-29T23:00:00.000Z',
    isActive: true,
    ticketTierIds: [],
  },
  {
    id: promotionId(4),
    eventId: nights.id,
    code: 'LAGUNE500',
    name: 'Offre prototype lagune',
    type: 'FIXED_AMOUNT',
    fixedAmount: money('500', 'XOF'),
    startsAt: '2026-09-01T00:00:00.000Z',
    endsAt: '2027-01-22T23:00:00.000Z',
    isActive: true,
    ticketTierIds: [],
  },
] as const satisfies readonly PromotionRecord[];
