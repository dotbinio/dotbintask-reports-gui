// API client for Taskwarrior backend

import { authService } from './auth';
import { storageService } from './storage';
import type { TasksResponse, ReportsResponse, ApiError, Task, Report } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_URL = `${BASE_URL}/api/v1`;

export class ApiClient {
  /**
   * Make an authenticated request to the API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = authService.getToken();
    
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    });

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, clear it
          authService.clearToken();
          throw new Error('Authentication failed. Please log in again.');
        }

        let errorData: ApiError;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            error: `HTTP ${response.status}: ${response.statusText}`,
            code: 'UNKNOWN_ERROR',
          };
        }

        throw new Error(errorData.error || 'An error occurred');
      }

      return response.json();
    } catch (error) {
      // Check for network/CORS errors
      if (error instanceof TypeError) {
        // This typically indicates CORS or network issues
        throw new Error(
          `Cannot connect to API at ${BASE_URL}. ` +
          'Please ensure the API server is running and CORS is enabled.'
        );
      }
      throw error;
    }
  }

  /**
   * Validate the authentication token
   * Returns: true if valid, false if invalid auth, throws on network errors
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.request('/reports');
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      
      // If it's a network error, throw it so caller can handle offline mode
      if (error instanceof Error && error.message.includes('Cannot connect')) {
        throw error;
      }
      
      // Otherwise, it's an auth failure
      return false;
    }
  }

  /**
   * Get list of available reports
   */
  async getReports(): Promise<Report[]> {
    try {
      const response = await this.request<ReportsResponse>('/reports');
      // Cache the reports for offline access
      storageService.cacheReports(response.reports);
      return response.reports;
    } catch (error) {
      // If offline, return cached reports
      const cached = storageService.getCachedReports();
      if (cached) {
        console.log('Using cached reports (offline mode)');
        return cached;
      }
      throw error;
    }
  }

  /**
   * Get tasks for a specific report
   * Returns tasks and a flag indicating if they're from cache
   */
  async getReportTasks(reportName: string): Promise<{ tasks: Task[], fromCache: boolean }> {
    try {
      const response = await this.request<TasksResponse>(
        `/reports/${reportName}/tasks`
      );
      // Cache the tasks for offline access
      storageService.cacheTasks(reportName, response.tasks);
      return { tasks: response.tasks, fromCache: false };
    } catch (error) {
      // If offline, return cached tasks
      const cached = storageService.getCachedTasks(reportName);
      if (cached) {
        console.log(`Using cached tasks for report '${reportName}' (offline mode)`);
        return { tasks: cached, fromCache: true };
      }
      throw error;
    }
  }

  /**
   * Get list of tasks with optional filters
   */
  async getTasks(params?: {
    status?: string;
    project?: string;
    tags?: string[];
  }): Promise<Task[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.status) {
      searchParams.append('status', params.status);
    }
    if (params?.project) {
      searchParams.append('project', params.project);
    }
    if (params?.tags) {
      params.tags.forEach(tag => searchParams.append('tags', tag));
    }

    const queryString = searchParams.toString();
    const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`;

    const response = await this.request<TasksResponse>(endpoint);
    return response.tasks;
  }

  /**
   * Get a single task by UUID
   */
  async getTask(uuid: string): Promise<Task> {
    return this.request<Task>(`/tasks/${uuid}`);
  }
}

export const apiClient = new ApiClient();

