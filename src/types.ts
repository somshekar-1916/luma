export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'developer' | 'viewer';
}

export interface TaskItem {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  dueDate: string;
  createdAt?: string;
}

export interface WorkspaceProject {
  _id?: string;
  id?: string;
  name: string;
  codebaseType: string;
  database: string;
  backend: string;
  frontend: string;
  auth: string;
  status: 'active' | 'archived' | 'staging';
  updatedAt?: string;
}

export interface RealtimeMessage {
  id?: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface AiPromptRequest {
  prompt: string;
  context?: string;
}
