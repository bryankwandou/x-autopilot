export interface HypeEvent {
  id: string;
  topic: string;
  source: string;
  metadata: any;
  velocity_score: number;
  emotion_score: number;
  controversy_score: number;
  estimated_half_life: number;
  timestamp: string;
}

export interface ScoredEvent extends HypeEvent {
  hypeScore: number;
}

export type AngleType = 'provocative' | 'insight' | 'controversial';

export interface AngleSet {
  eventId: string;
  angles: {
    type: AngleType;
    content: string;
    predictionScore: number;
  }[];
}

export interface ContentPiece {
  id: string;
  event_id: string;
  text: string;
  format: 'tweet' | 'thread' | 'reply';
  category: 'provocative' | 'insight' | 'controversial';
  hasVisual: boolean;
  visualPrompt?: string;
  visualUrl?: string;
  scheduledAt: string;
  priority?: 'HIGH' | 'NORMAL';
}

export interface ExecutionReceipt {
  contentId: string;
  platformId: string; // X Tweet ID
  timestamp: string;
  status: 'success' | 'failed';
  error?: string;
}

export interface PerformanceMetrics {
  contentId: string;
  impressions: number;
  likes: number;
  replies: number;
  reposts: number;
  followerDelta: number;
}
