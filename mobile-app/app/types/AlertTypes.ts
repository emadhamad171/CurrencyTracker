// app/(tabs)/types/AlertTypes.ts
export interface PriceAlert {
  id: string;
  userId: string;
  currencyPair:
    | 'USDUAH'
    | 'EURUAH'
    | 'GBPUAH'
    | 'CHFUAH'
    | 'JPYUAH'
    | 'CADUAH'
    | 'AUDUAH'
    | 'PLNUAH'
    | 'CZKUAH'
    | 'CNHUAH';
  alertType: 'above' | 'below';
  targetPrice: number;
  pushToken: string;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
  currentPriceAtCreation: number;
  lastChecked: string;
  currentPrice?: number;
  status?: string;
  distanceToTarget?: {
    absolute: number;
    percentage: number;
    direction: 'above' | 'below';
  };
}

export interface AlertsStats {
  active: number;
  triggered: number;
  total: number;
  byPair: {
    USDUAH: { active: number; triggered: number };
    EURUAH: { active: number; triggered: number };
    GBPUAH: { active: number; triggered: number };
    CHFUAH: { active: number; triggered: number };
    JPYUAH: { active: number; triggered: number };
    CADUAH: { active: number; triggered: number };
    AUDUAH: { active: number; triggered: number };
    PLNUAH: { active: number; triggered: number };
    CZKUAH: { active: number; triggered: number };
    CNHUAH: { active: number; triggered: number };
  };
}

export interface NewAlertForm {
  currencyPair: string;
  alertType: 'above' | 'below';
  targetPrice: string;
  currentPrice: number;
}
