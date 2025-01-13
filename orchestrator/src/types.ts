import { Socket } from 'socket.io';

export interface ChatMessage {
  room: string;
  message: string;
  userId: string;
  timestamp?: number;
}

export interface ServiceHealth {
  status: string;
  timestamp: Date;
  services: {
    redis: 'connected' | 'disconnected';
    elasticsearch: 'connected' | 'disconnected';
    mongodb: 'connected' | 'disconnected';
    rabbitmq: 'connected' | 'disconnected';
    openai: 'configured' | 'not configured';
  };
}

export interface AppSocket extends Socket {
  userId?: string;
  rooms: Set<string>;
} 