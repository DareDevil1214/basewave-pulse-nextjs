// src/api/scheduler.ts

import { 
  ApiResponse, 
  BlogSchedule, 
  CreateScheduleRequest, 
  CronConversionRequest, 
  CronConversionResponse, 
  SchedulerStatus, 
  GeneratedBlog 
} from '../types/scheduler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class SchedulerAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Create schedule from UTC time
  async createScheduleFromTime(request: CreateScheduleRequest): Promise<ApiResponse<BlogSchedule>> {
    return this.request<BlogSchedule>('/api/scheduler/create-from-time', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Create schedule with cron expression
  async createSchedule(schedule: Partial<BlogSchedule>): Promise<ApiResponse<BlogSchedule>> {
    return this.request<BlogSchedule>('/api/scheduler/create', {
      method: 'POST',
      body: JSON.stringify(schedule),
    });
  }

  // Get all schedules
  async getSchedules(portal?: string): Promise<ApiResponse<BlogSchedule[]>> {
    const endpoint = portal ? `/api/scheduler/list?portal=${encodeURIComponent(portal)}` : '/api/scheduler/list';
    return this.request<BlogSchedule[]>(endpoint);
  }

  // Get single schedule
  async getSchedule(id: string): Promise<ApiResponse<BlogSchedule>> {
    return this.request<BlogSchedule>(`/api/scheduler/${id}`);
  }

  // Update schedule
  async updateSchedule(id: string, updates: Partial<BlogSchedule>): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/scheduler/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Delete schedule
  async deleteSchedule(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/scheduler/${id}`, {
      method: 'DELETE',
    });
  }

  // Start schedule
  async startSchedule(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/scheduler/${id}/start`, {
      method: 'POST',
    });
  }

  // Stop schedule
  async stopSchedule(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/scheduler/${id}/stop`, {
      method: 'POST',
    });
  }

  // Execute schedule immediately
  async executeSchedule(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/scheduler/${id}/execute`, {
      method: 'POST',
    });
  }

  // Convert time to cron expression
  async convertTimeToCron(request: CronConversionRequest): Promise<ApiResponse<CronConversionResponse>> {
    return this.request<CronConversionResponse>('/api/scheduler/convert-time-to-cron', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Validate cron expression (UTC only)
  async validateCron(cronExpression: string): Promise<ApiResponse<any>> {
    return this.request<any>('/api/scheduler/validate-cron', {
      method: 'POST',
      body: JSON.stringify({ cronExpression }),
    });
  }

  // Schedule immediate execution
  async scheduleImmediate(request: CreateScheduleRequest): Promise<ApiResponse<BlogSchedule>> {
    return this.request<BlogSchedule>('/api/scheduler/schedule-immediate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get scheduler status
  async getSchedulerStatus(): Promise<ApiResponse<SchedulerStatus>> {
    return this.request<SchedulerStatus>('/api/scheduler/status/overview');
  }

  // Get generated blogs for a schedule
  async getGeneratedBlogs(
    scheduleId: string,
    options: {
      limit?: number;
      status?: string;
      includeContent?: boolean;
    } = {}
  ): Promise<ApiResponse<{ schedule: BlogSchedule; generatedBlogs: GeneratedBlog[]; totalFound: number; filters: any }>> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.status) params.append('status', options.status);
    if (options.includeContent) params.append('includeContent', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<any>(`/api/scheduler/${scheduleId}/generated-blogs${query}`);
  }

  // Get execution history
  async getExecutionHistory(scheduleId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/scheduler/${scheduleId}/execution-history`);
  }
}

export const schedulerAPI = new SchedulerAPI();
