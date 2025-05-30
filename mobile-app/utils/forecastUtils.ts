export const getDirectionColor = (direction: string) => {
  switch (direction) {
    case 'bullish':
      return '#16A085';
    case 'bearish':
      return '#E74C3C';
    default:
      return '#F39C12';
  }
};

export const getDirectionIcon = (direction: string) => {
  switch (direction) {
    case 'bullish':
      return '↗';
    case 'bearish':
      return '↘';
    default:
      return '→';
  }
};

export const getDirectionText = (direction: string) => {
  switch (direction) {
    case 'bullish':
      return 'GROWTH';
    case 'bearish':
      return 'DECLINE';
    default:
      return 'FLAT';
  }
};

export const getConfidenceLevel = (confidence: number) => {
  if (confidence >= 80) {
    return { text: 'HIGH', color: '#16A085' };
  }
  if (confidence >= 60) {
    return { text: 'MEDIUM', color: '#F39C12' };
  }
  return { text: 'LOW', color: '#E74C3C' };
};

export const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'high':
      return '#E74C3C';
    case 'medium':
      return '#F39C12';
    default:
      return '#16A085';
  }
};

export const getSpreadStatusColor = (status: string) => {
  switch (status) {
    case 'CRITICAL':
      return '#E74C3C';
    case 'ELEVATED':
      return '#F39C12';
    default:
      return '#16A085';
  }
};
