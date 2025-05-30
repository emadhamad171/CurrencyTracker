export interface ForecastIndicators {
  dxy: {
    value: number;
    changePercent: number;
  };
  rates: {
    fed: number;
    ecb: number;
    nbu: number;
  };
  gdp: {
    usa: { value: number; trend: 'up' | 'down' };
    eu: { value: number; trend: 'up' | 'down' };
    ukraine: { value: number; trend: 'up' | 'down' };
  };
}

export interface CurrencyForecast {
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  currentPrice: number;
  factors: string[];
  targets?: {
    bullish?: { target: number; stop: number };
    bearish?: { target: number; stop: number };
  };
  technicalLevels?: {
    support: number;
    resistance: number;
  };
  spreadAnalysis?: {
    percent: number;
    status: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  };
}

export interface UpcomingEvent {
  date: string;
  event: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}
