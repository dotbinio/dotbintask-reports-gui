// Storage service for preferences and offline data

import type { LayoutConfig, Report } from '../types';

const REPORT_PREFERENCES_KEY = 'taskwarrior_report_preferences';
const LAYOUT_CONFIG_KEY = 'taskwarrior_layout_config';
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
   * Get layout configuration from localStorage
   * Migrates old preferences to new layout format if needed
   */
  getLayoutConfig(availableReports?: Report[]): LayoutConfig {
    const stored = localStorage.getItem(LAYOUT_CONFIG_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse layout config', e);
      }
    }
    
    // Try to migrate from old preferences
    const oldPrefs = localStorage.getItem(REPORT_PREFERENCES_KEY);
    if (oldPrefs) {
      try {
        const prefs = JSON.parse(oldPrefs);
        if (prefs.selectedReports && Array.isArray(prefs.selectedReports)) {
          return {
            tiles: prefs.selectedReports.map((reportName: string) => ({
              reportName,
              width: 'half' as const,
            })),
          };
        }
      } catch (e) {
        console.error('Failed to migrate old preferences', e);
      }
    }
    
    // Default layout: 'next' and 'active' if available
    const defaultReports = availableReports 
      ? availableReports.filter(r => ['next', 'active'].includes(r.name)).map(r => r.name)
      : ['next', 'active'];
    
    return {
      tiles: defaultReports.map(reportName => ({
        reportName,
        width: 'half' as const,
      })),
    };
  },

  /**
   * Save layout configuration to localStorage
   */
  setLayoutConfig(config: LayoutConfig): void {
    localStorage.setItem(LAYOUT_CONFIG_KEY, JSON.stringify(config));
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

