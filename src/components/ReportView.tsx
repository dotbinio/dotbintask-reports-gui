import { useState, useEffect } from 'preact/hooks';
import type { Task, Report } from '../types';
import { apiClient } from '../services/api';
import { TaskList } from './TaskList';

interface ReportViewProps {
  reportName: string;
  reportLabel?: string;
  onTaskCountChange?: (count: number) => void;
  onLoadingChange?: (loading: boolean) => void;
  onOfflineChange?: (offline: boolean) => void;
}

export function ReportView({ reportName, onTaskCountChange, onLoadingChange, onOfflineChange }: ReportViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [reportConfig, setReportConfig] = useState<Report | null>(null);

  useEffect(() => {
    loadReportAndTasks();
  }, [reportName]);

  // Notify parent of state changes
  useEffect(() => {
    onTaskCountChange?.(tasks.length);
  }, [tasks.length, onTaskCountChange]);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  useEffect(() => {
    onOfflineChange?.(isOffline);
  }, [isOffline, onOfflineChange]);

  const loadReportAndTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsOffline(false);
      
      // Load report configuration
      const reports = await apiClient.getReports();
      const report = reports.find(r => r.name === reportName);
      setReportConfig(report || null);
      
      // Load tasks
      const result = await apiClient.getReportTasks(reportName);
      setTasks(result.tasks);
      setIsOffline(result.fromCache);
      
      // Clear any previous errors if we got data (even from cache)
      if (result.tasks.length > 0 || result.fromCache) {
        setError(null);
      }
    } catch (err) {
      console.error(`Failed to load tasks for report '${reportName}':`, err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      setIsOffline(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <progress />
          <p>Loading tasks...</p>
        </div>
      )}

      {error && !loading && tasks.length === 0 && (
        <div style={{ padding: '1rem' }}>
          <small style={{ color: 'var(--del-color, #d32f2f)' }}>
            {error}
          </small>
        </div>
      )}

      {!loading && !error && (
        <TaskList 
          tasks={tasks} 
          columns={reportConfig?.columns}
          labels={reportConfig?.labels}
        />
      )}

      {!loading && isOffline && tasks.length > 0 && (
        <footer>
          <small>Showing cached data from last sync</small>
        </footer>
      )}
    </>
  );
}

