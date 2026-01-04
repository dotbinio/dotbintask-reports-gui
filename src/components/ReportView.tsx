import { useState, useEffect } from 'preact/hooks';
import type { Task } from '../types';
import { apiClient } from '../services/api';
import { TaskList } from './TaskList';

interface ReportViewProps {
  reportName: string;
  reportLabel?: string;
}

export function ReportView({ reportName, reportLabel }: ReportViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [reportName]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsOffline(false);
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

  const displayName = reportLabel || reportName;

  return (
    <article style={{ marginBottom: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, textTransform: 'capitalize' }}>
          {displayName}
          {tasks.length > 0 && !loading && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', fontWeight: 'normal' }}>
              ({tasks.length} {tasks.length === 1 ? 'task' : 'tasks'})
            </span>
          )}
        </h3>
        {isOffline && (
          <small style={{ color: 'var(--ins-color, #ff9800)' }}>
            ⚠️ Offline mode
          </small>
        )}
      </header>

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

      {!loading && !error && <TaskList tasks={tasks} />}

      {!loading && isOffline && tasks.length > 0 && (
        <footer>
          <small>Showing cached data from last sync</small>
        </footer>
      )}
    </article>
  );
}

