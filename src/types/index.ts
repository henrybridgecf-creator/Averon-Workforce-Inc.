export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  balance: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    lastUpdated: number;
  };
  profileImageUrl?: string;
  averpayId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected';
  category: string;
  deadline: number;
  assignedTo?: string[];
  uploadedBy: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    accountHolder: string;
  };
  reason?: string;
  adminNotes?: string;
  requestedAt: number;
  reviewedAt?: number;
  completedAt?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  relatedEntityId?: string;
  relatedEntityType?: 'project' | 'withdrawal' | 'message';
  createdAt: number;
}
