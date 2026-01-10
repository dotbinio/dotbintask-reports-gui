import type { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  columns?: string;
  labels?: string;
}

export function TaskList({ tasks, columns, labels }: TaskListProps) {
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
    if (urgency >= 10) return '#ef4444';
    if (urgency >= 5) return '#f59e0b';
    return '#10b981';
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    const colors: Record<string, string> = {
      H: '#ef4444',
      M: '#f59e0b',
      L: '#3b82f6',
    };

    return (
      <span 
        style={{ 
          padding: '0.15rem 0.5rem',
          borderRadius: '0.25rem',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.025em',
          backgroundColor: colors[priority] || '',
          color: 'white',
          marginLeft: '0.5rem',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
        }}
      >
        {priority}
      </span>
    );
  };

  // Parse columns and labels from comma-separated strings
  const columnNames = columns ? columns.split(',').map(c => c.trim()) : ['description', 'project', 'tags', 'urgency', 'due'];
  const columnLabels = labels ? labels.split(',').map(l => l.trim()) : ['Description', 'Project', 'Tags', 'Urgency', 'Due'];

  // Get value from task based on column name
  const getColumnValue = (task: Task, column: string) => {
    // Handle column modifiers (e.g., description.count, due.relative)
    // Extract the base column name (before any dot notation)
    const baseColumn = column.split('.')[0];
    
    const value = task[column as keyof Task] || task[baseColumn as keyof Task];
    
    // Handle special rendering for certain columns
    switch (baseColumn) {
      case 'id':
        return task.id !== undefined ? task.id : '-';
      
      case 'description':
        return (
          <>
            {task.description}
            {task.priority && getPriorityBadge(task.priority)}
          </>
        );
      
      case 'project':
        return task.project || '-';
      
      case 'tags':
        return task.tags && task.tags.length > 0 ? (
          <small>{task.tags.join(', ')}</small>
        ) : (
          '-'
        );
      
      case 'urgency':
        return (
          <span style={{ 
            color: getUrgencyColor(task.urgency),
            fontWeight: 600,
            fontSize: '0.8125rem'
          }}>
            {task.urgency?.toFixed(1) || '-'}
          </span>
        );
      
      case 'due':
      case 'entry':
      case 'modified':
      case 'start':
      case 'end':
      case 'wait':
      case 'scheduled':
        // If the column has a modifier (like due.relative), we still format the base date value
        return formatDate(task[baseColumn as keyof Task] as string);
      
      case 'priority':
        return task.priority || '-';
      
      case 'status':
        return task.status || '-';
      
      case 'depends':
        return task.depends && task.depends.length > 0 ? (
          <small>{task.depends.join(', ')}</small>
        ) : (
          '-'
        );
      
      case 'recur':
        return task.recur || '-';
      
      default:
        // For any other columns, try to display the value as-is
        if (value === null || value === undefined) return '-';
        if (Array.isArray(value)) return value.join(', ') || '-';
        return String(value);
    }
  };

  return (
    <div>
      <table role="grid">
        <thead>
          <tr>
            {columnLabels.map((label, index) => (
              <th key={index}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.uuid}>
              {columnNames.map((column, index) => (
                <td key={index}>{getColumnValue(task, column)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

