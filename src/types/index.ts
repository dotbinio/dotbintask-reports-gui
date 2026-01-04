// TypeScript types for Taskwarrior API

export interface Task {
  uuid: string;
  description: string;
  status: 'pending' | 'completed' | 'deleted' | 'waiting';
  project?: string;
  tags?: string[];
  priority?: 'H' | 'M' | 'L';
  urgency?: number;
  entry?: string;
  modified?: string;
  start?: string;
  end?: string;
  due?: string;
  wait?: string;
  scheduled?: string;
  depends?: string[];
  recur?: string;
  annotations?: Annotation[];
}

export interface Annotation {
  entry: string;
  description: string;
}

export interface Report {
  name: string;
  label?: string;
  description?: string;
  columns?: string[];
  labels?: string[];
  sort?: string[];
  filter?: string;
}

export interface TasksResponse {
  tasks: Task[];
  count: number;
}

export interface ReportsResponse {
  reports: Report[];
  count: number;
}

export interface ProjectsResponse {
  projects: Project[];
  count: number;
}

export interface Project {
  name: string;
  count: number;
}

export interface TaskCreate {
  description: string;
  project?: string;
  tags?: string[];
  priority?: 'H' | 'M' | 'L';
  due?: string;
  wait?: string;
  scheduled?: string;
  depends?: string[];
  recur?: string;
}

export interface TaskModify {
  description?: string;
  project?: string;
  priority?: 'H' | 'M' | 'L';
  due?: string;
  wait?: string;
  scheduled?: string;
}

export interface ApiError {
  error: string;
  code: string;
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

export interface ReportPreferences {
  selectedReports: string[];
}

export interface TasksResult {
  tasks: Task[];
  fromCache: boolean;
}

