// src/types/scheduler.ts

export interface BlogSchedule {
  id: string;
  name: string;
  description: string;
  cronExpression: string;
  timezone: string;
  portal: string;
  generateImage: boolean;
  imageStyle: 'professional' | 'creative' | 'minimalist' | 'tech' | 'lifestyle';
  isActive: boolean;
  nextRunTime: string | null;
  executionCount: number;
  createdAt: string;
  updatedAt: string;
  lastExecuted?: string;
  lastStatus?: 'success' | 'error' | 'never_executed';
  lastResult?: any;
  lastError?: string;
  originalTime?: string;
  frequency?: ScheduleFrequency;
  dayOfWeek?: number; // 0-6 for weekly (0=Sunday)
  autoDelete?: boolean;
  jobStatus?: JobStatus;
  templateId?: string;
  keyword?: string;
  generateSocial?: boolean; // New field for social media generation
}

export type ScheduleFrequency = 'once' | 'daily' | 'weekly';

export interface CreateScheduleRequest {
  name: string;
  description?: string;
  utcTime: string; // ISO string format
  frequency: ScheduleFrequency;
  dayOfWeek?: number; // 0-6 for weekly (0=Sunday)
  timezone?: string;
  portal?: string;
  generateImage?: boolean;
  imageStyle?: 'professional' | 'creative' | 'minimalist' | 'tech' | 'lifestyle';
  isActive?: boolean;
  templateId?: string;
  keyword?: string;
  generateSocial?: boolean; // New field for social media generation
}

export interface CronConversionRequest {
  utcTime: string;
  frequency: ScheduleFrequency;
  dayOfWeek?: number;
  timezone?: string;
}

export interface CronConversionResponse {
  cronExpression: string;
  nextRunTime: string;
  frequency: ScheduleFrequency;
  timezone: string;
  originalTime: string;
  explanation: string;
}

export interface JobStatus {
  isRunning: boolean;
  lastRun?: string;
  nextRun?: string;
  status: 'active' | 'inactive' | 'error';
}

export interface SchedulerStatus {
  totalSchedules: number;
  activeSchedules: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  activeJobs: JobStatus[];
  collections: {
    schedules: string;
    generatedBlogs: string;
  };
}

export interface GeneratedBlog {
  id: string;
  title: string;
  portal: string;
  status: string;
  createdAt: string;
  wordCount: number;
  imageUrl?: string;
  projectedTraffic?: number;
  difficulty?: string;
  content?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface TimeZoneOption {
  value: string;
  label: string;
  offset: string;
}

export interface ScheduleFormData {
  name: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  frequency: ScheduleFrequency;
  dayOfWeek?: number;
  portal: string;
  generateImage: boolean;
  imageStyle: 'professional' | 'creative' | 'minimalist' | 'tech' | 'lifestyle';
  templateId?: string;
  keyword?: string;
  timezone?: string;
  generateSocial: boolean; // New field for social media generation
}
