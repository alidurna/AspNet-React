/**
 * User Types - TaskFlow Frontend
 *
 * Kullanıcı modeli ve profil yönetimi ile ilgili type tanımları.
 */

/**
 * Kullanıcı Model Interface
 *
 * Backend'deki User entity'si ve UserDto ile uyumlu.
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  isEmailVerified: boolean;
}

/**
 * User Profile Interface
 *
 * Kullanıcı profil bilgileri için detaylı interface.
 */
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  isEmailVerified: boolean;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  isActive: boolean;
  role: string;
  preferences?: UserPreferences;
}

/**
 * User Preferences Interface
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    taskReminders: boolean;
    weeklyReports: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showPhone: boolean;
  };
}

/**
 * Update Profile Request Interface
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  preferences?: Partial<UserPreferences>;
}

/**
 * User Statistics Interface
 */
export interface UserStatsDto {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number; // in hours
  streakDays: number;
  totalCategories: number;
  thisWeekTasks: number;
  thisMonthTasks: number;
  productivity: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  recentActivity: Array<{
    id: string;
    type: 'task_created' | 'task_completed' | 'category_created';
    description: string;
    timestamp: string;
  }>;
}

/**
 * User Search Result Interface
 */
export interface UserSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  isActive: boolean;
  lastSeen?: string;
} 