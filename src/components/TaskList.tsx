import type { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <em>No tasks found</em>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getUrgencyColor = (urgency?: number) => {
    if (!urgency) return '';
    if (urgency >= 10) return 'var(--del-color, #d32f2f)';
    if (urgency >= 5) return 'var(--ins-color, #ff9800)';
    return '';
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    const colors: Record<string, string> = {
      H: 'var(--del-color, #d32f2f)',
      M: 'var(--ins-color, #ff9800)',
      L: 'var(--primary, #1095c1)',
    };

    return (
      <span 
        style={{ 
          padding: '0.15rem 0.4rem',
          borderRadius: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          backgroundColor: colors[priority] || '',
          color: 'white',
          marginLeft: '0.5rem',
        }}
      >
        {priority}
      </span>
    );
  };

  return (
    <div>
      <table role="grid">
        <thead>
          <tr>
            <th>Description</th>
            <th>Project</th>
            <th>Tags</th>
            <th>Urgency</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.uuid}>
              <td>
                {task.description}
                {getPriorityBadge(task.priority)}
              </td>
              <td>{task.project || '-'}</td>
              <td>
                {task.tags && task.tags.length > 0 ? (
                  <small>{task.tags.join(', ')}</small>
                ) : (
                  '-'
                )}
              </td>
              <td>
                <span style={{ color: getUrgencyColor(task.urgency) }}>
                  {task.urgency?.toFixed(1) || '-'}
                </span>
              </td>
              <td>{formatDate(task.due)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

