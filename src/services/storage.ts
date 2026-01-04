// Storage service for preferences and offline data

const REPORT_PREFERENCES_KEY = 'taskwarrior_report_preferences';
const CACHED_TASKS_PREFIX = 'taskwarrior_cached_tasks_';
const CACHED_REPORTS_KEY = 'taskwarrior_cached_reports';

export interface ReportPreferences {
  selectedReports: string[];
}

export const storageService = {
  /**
   * Get report preferences from localStorage
   */
  getReportPreferences(): ReportPreferences {
    const stored = localStorage.getItem(REPORT_PREFERENCES_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse report preferences', e);
      }
    }
    // Default to showing 'next' and 'active' reports
    return { selectedReports: ['next', 'active'] };
  },

  /**
   * Save report preferences to localStorage
   */
  setReportPreferences(preferences: ReportPreferences): void {
    localStorage.setItem(REPORT_PREFERENCES_KEY, JSON.stringify(preferences));
  },

  /**
   * Cache tasks data for a specific report
   */
  cacheTasks(reportName: string, tasks: any[]): void {
    const key = `${CACHED_TASKS_PREFIX}${reportName}`;
    const data = {
      tasks,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(data));
  },

  /**
   * Get cached tasks for a specific report
   */
  getCachedTasks(reportName: string): any[] | null {
    const key = `${CACHED_TASKS_PREFIX}${reportName}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.tasks;
      } catch (e) {
        console.error('Failed to parse cached tasks', e);
      }
    }
    return null;
  },

  /**
   * Cache available reports list
   */
  cacheReports(reports: any[]): void {
    const data = {
      reports,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHED_REPORTS_KEY, JSON.stringify(data));
  },

  /**
   * Get cached reports list
   */
  getCachedReports(): any[] | null {
    const stored = localStorage.getItem(CACHED_REPORTS_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.reports;
      } catch (e) {
        console.error('Failed to parse cached reports', e);
      }
    }
    return null;
  },

  /**
   * Clear all cached data
   */
  clearCache(): void {
    // Clear all keys that start with our prefixes
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHED_TASKS_PREFIX) || key === CACHED_REPORTS_KEY) {
        localStorage.removeItem(key);
      }
    });
  },
};

