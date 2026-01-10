import { useState } from 'preact/hooks';
import { ReportView } from './ReportView';

interface ReportTileProps {
  reportName: string;
  reportLabel?: string;
  width: 'full' | 'half';
  showRemove: boolean;
  onRemove: () => void;
}

export function ReportTile({ 
  reportName, 
  reportLabel, 
  width, 
  showRemove, 
  onRemove 
}: ReportTileProps) {
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const displayName = reportLabel || reportName;

  return (
    <article className={`report-tile ${width === 'full' ? 'tile-full' : 'tile-half'}`}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, textTransform: 'capitalize' }}>
          {displayName}
          {taskCount > 0 && !loading && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', fontWeight: 'normal' }}>
              ({taskCount} {taskCount === 1 ? 'task' : 'tasks'})
            </span>
          )}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isOffline && (
            <small style={{ color: 'var(--ins-color, #ff9800)' }}>
              ⚠️ Offline
            </small>
          )}
          {showRemove && (
            <button 
              onClick={onRemove}
              className="tile-remove-btn secondary outline"
              aria-label="Remove tile"
              style={{ 
                padding: '0.25rem 0.5rem',
                fontSize: '0.875rem',
                margin: 0,
              }}
            >
              ✕
            </button>
          )}
        </div>
      </header>
      
      <div className="tile-content">
        <ReportView 
          reportName={reportName}
          reportLabel={reportLabel}
          onTaskCountChange={setTaskCount}
          onLoadingChange={setLoading}
          onOfflineChange={setIsOffline}
        />
      </div>
    </article>
  );
}

