# 🎨 Frontend Mimarisi

TaskFlow frontend sisteminin detaylı mimari dokümantasyonu.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Teknoloji Stack](#teknoloji-stack)
- [Proje Yapısı](#proje-yapısı)
- [Component Mimarisi](#component-mimarisi)
- [State Management](#state-management)
- [Routing](#routing)
- [Performance Optimizasyonu](#performance-optimizasyonu)
- [Security](#security)

## 🎯 Genel Bakış

TaskFlow frontend'i **React 18** tabanlı, **TypeScript** ile geliştirilmiş modern bir SPA (Single Page Application) olarak tasarlanmıştır. **Component-based architecture**, **hooks-based state management** ve **performance-first** yaklaşımı benimser.

### Mimari Prensipler
- **Component Composition**: Bileşen kompozisyonu
- **Separation of Concerns**: Sorumlulukların ayrılması
- **Performance Optimization**: Performans optimizasyonu
- **Accessibility**: Erişilebilirlik
- **Responsive Design**: Duyarlı tasarım
- **Progressive Enhancement**: Aşamalı geliştirme

## 🛠️ Teknoloji Stack

### Core Framework
- **React 18**: Modern React sürümü
- **TypeScript 5**: Tip güvenliği
- **Vite**: Hızlı build tool
- **React Router 6**: Client-side routing

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Headless UI**: Erişilebilir UI bileşenleri
- **Lucide React**: Modern ikon seti
- **Framer Motion**: Animasyon kütüphanesi

### State Management
- **Redux Toolkit**: Global state management
- **React Query**: Server state management
- **Zustand**: Lightweight state management
- **React Hook Form**: Form state management

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Vitest**: Unit testing
- **Cypress**: E2E testing

### Performance & Monitoring
- **React Query**: Data fetching & caching
- **React.memo**: Component memoization
- **useMemo/useCallback**: Performance hooks
- **Web Vitals**: Performance monitoring

## 📁 Proje Yapısı

```
TaskFlow.Frontend/
├── 📁 public/                    # Static assets
│   ├── manifest.json            # PWA manifest
│   ├── offline.html             # Offline page
│   └── sw.js.disabled           # Service Worker
├── 📁 src/                      # Source code
│   ├── 📁 assets/               # Static assets
│   │   └── react.svg
│   ├── 📁 components/           # Reusable components
│   │   ├── 📁 auth/             # Authentication components
│   │   ├── 📁 common/           # Common components
│   │   ├── 📁 dashboard/        # Dashboard components
│   │   ├── 📁 layout/           # Layout components
│   │   ├── 📁 search/           # Search components
│   │   ├── 📁 security/         # Security components
│   │   ├── 📁 tasks/            # Task components
│   │   └── 📁 ui/               # UI components
│   ├── 📁 config/               # Configuration
│   │   ├── environment.ts       # Environment variables
│   │   └── theme.ts             # Theme configuration
│   ├── 📁 contexts/             # React contexts
│   │   ├── AuthContext.tsx      # Authentication context
│   │   └── ThemeContext.tsx     # Theme context
│   ├── 📁 hooks/                # Custom hooks
│   │   ├── useAnalytics.ts      # Analytics hook
│   │   ├── useAnimations.ts     # Animation hooks
│   │   ├── useErrorMonitoring.ts # Error monitoring
│   │   ├── useOfflineFirst.ts   # Offline-first hook
│   │   ├── useOptimisticUpdate.ts # Optimistic updates
│   │   ├── usePerformance.ts    # Performance hook
│   │   ├── usePWA.ts            # PWA hook
│   │   ├── useRateLimit.ts      # Rate limiting
│   │   ├── useSignalR.ts        # Real-time communication
│   │   └── useToast.ts          # Toast notifications
│   ├── 📁 pages/                # Page components
│   │   ├── Categories.tsx       # Categories page
│   │   ├── Dashboard.tsx        # Dashboard page
│   │   ├── ForgotPassword.tsx   # Forgot password page
│   │   ├── Login.tsx            # Login page
│   │   ├── Profile.tsx          # Profile page
│   │   ├── Register.tsx         # Register page
│   │   ├── ResetPassword.tsx    # Reset password page
│   │   ├── Security.tsx         # Security page
│   │   ├── Statistics.tsx       # Statistics page
│   │   └── Tasks.tsx            # Tasks page
│   ├── 📁 schemas/              # Validation schemas
│   │   ├── authSchemas.ts       # Authentication schemas
│   │   └── taskSchemas.ts       # Task schemas
│   ├── 📁 services/             # API services
│   │   ├── api.ts               # API client
│   │   └── performance.ts       # Performance service
│   ├── 📁 store/                # Redux store
│   │   ├── index.ts             # Store configuration
│   │   └── 📁 slices/           # Redux slices
│   │       ├── authSlice.ts     # Authentication slice
│   │       ├── categoriesSlice.ts # Categories slice
│   │       ├── tasksSlice.ts    # Tasks slice
│   │       └── uiSlice.ts       # UI slice
│   ├── 📁 types/                # TypeScript types
│   │   ├── auth.types.ts        # Authentication types
│   │   ├── category.types.ts    # Category types
│   │   ├── file.types.ts        # File types
│   │   ├── search.types.ts      # Search types
│   │   └── task.types.ts        # Task types
│   ├── 📁 utils/                # Utility functions
│   │   ├── fileIcons.tsx        # File icon utilities
│   │   ├── testUtils.tsx        # Test utilities
│   │   └── utils.ts             # General utilities
│   ├── App.css                  # Global styles
│   ├── App.tsx                  # Main app component
│   ├── index.css                # Base styles
│   └── main.tsx                 # App entry point
├── 📁 cypress/                  # E2E testing
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── vite.config.ts               # Vite configuration
```

## 🧩 Component Mimarisi

### Component Hierarchy
```
App
├── AuthProvider
├── ThemeProvider
├── ReduxProvider
├── QueryProvider
├── ErrorBoundary
└── Router
    ├── AuthLayout
    │   ├── Login
    │   ├── Register
    │   ├── ForgotPassword
    │   └── ResetPassword
    └── DashboardLayout
        ├── Header
        ├── Sidebar
        └── Routes
            ├── Dashboard
            ├── Tasks
            ├── Categories
            ├── Statistics
            ├── Profile
            └── Security
```

### Component Categories

#### 1. **Layout Components**
```typescript
// DashboardLayout.tsx
interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { isOnline } = useOfflineFirst();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-gray-50 border-b border-gray-200 p-3 text-center">
          <span className="text-gray-600 text-sm">
            Çevrimdışı mod - İnternet bağlantınızı kontrol edin
          </span>
        </div>
      )}
      
      <Header user={user} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
```

#### 2. **UI Components**
```typescript
// Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  };
  
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};
```

#### 3. **Feature Components**
```typescript
// TaskList.tsx
interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  loading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  loading = false
}) => {
  const { trackEvent } = useAnalytics();

  const handleTaskToggle = useCallback((taskId: string, completed: boolean) => {
    onTaskUpdate(taskId, { 
      status: completed ? 'completed' : 'pending',
      progress: completed ? 100 : 0
    });
    
    trackEvent('task_toggled', {
      taskId,
      completed,
      source: 'task_list'
    });
  }, [onTaskUpdate, trackEvent]);

  if (loading) {
    return <SkeletonGroup count={5} />;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={handleTaskToggle}
          onDelete={onTaskDelete}
          onUpdate={onTaskUpdate}
        />
      ))}
    </div>
  );
};
```

## 🔄 State Management

### Redux Store Structure
```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from '../services/api';
import authReducer from './slices/authSlice';
import tasksReducer from './slices/tasksSlice';
import categoriesReducer from './slices/categoriesSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    tasks: tasksReducer,
    categories: categoriesReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Redux Slices
```typescript
// store/slices/tasksSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskSearchDto } from '../../types/task.types';
import { tasksAPI } from '../../services/api';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: TaskSearchDto;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    search: '',
    category: '',
    priority: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (filters: TaskSearchDto) => {
    const response = await tasksAPI.getTasks(filters);
    return response.data;
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: Partial<Task>) => {
    const response = await tasksAPI.createTask(taskData);
    return response.data.task;
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<TaskSearchDto>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    updateTaskOptimistically: (state, action: PayloadAction<{ id: string; updates: Partial<Task> }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id);
      if (task) {
        Object.assign(task, action.payload.updates);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Görevler yüklenirken hata oluştu';
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
        state.pagination.total += 1;
      });
  }
});

export const { setFilters, clearFilters, updateTaskOptimistically } = tasksSlice.actions;
export default tasksSlice.reducer;
```

### React Query Integration
```typescript
// hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../services/api';
import { Task, TaskSearchDto } from '../types/task.types';

export const useTasks = (filters: TaskSearchDto) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksAPI.getTasks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskData: Partial<Task>) => tasksAPI.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error('Task creation failed:', error);
    }
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      tasksAPI.updateTask(id, updates),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(['tasks'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          tasks: oldData.tasks.map((task: Task) =>
            task.id === updatedTask.id ? updatedTask : task
          )
        };
      });
    }
  });
};
```

## 🛣️ Routing

### Route Configuration
```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './components/layout/AuthLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="categories" element={<Categories />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="profile" element={<Profile />} />
            <Route path="security" element={<Security />} />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};
```

### Route Guards
```typescript
// components/common/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

## ⚡ Performance Optimizasyonu

### Code Splitting
```typescript
// components/performance/LazyRoutes.tsx
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// Lazy load pages
const Dashboard = lazy(() => import('../../pages/Dashboard'));
const Tasks = lazy(() => import('../../pages/Tasks'));
const Categories = lazy(() => import('../../pages/Categories'));
const Statistics = lazy(() => import('../../pages/Statistics'));
const Profile = lazy(() => import('../../pages/Profile'));
const Security = lazy(() => import('../../pages/Security'));

const LazyRoute: React.FC<{ component: React.ComponentType }> = ({ component: Component }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);

// Usage in routes
<Route path="dashboard" element={<LazyRoute component={Dashboard} />} />
```

### Component Memoization
```typescript
// components/tasks/TaskCard.tsx
import { memo, useCallback } from 'react';

interface TaskCardProps {
  task: Task;
  onToggle: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const TaskCard: React.FC<TaskCardProps> = memo(({ task, onToggle, onDelete, onUpdate }) => {
  const handleToggle = useCallback(() => {
    onToggle(task.id, task.status !== 'completed');
  }, [task.id, task.status, onToggle]);

  const handleDelete = useCallback(() => {
    onDelete(task.id);
  }, [task.id, onDelete]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={task.status === 'completed'}
            onChange={handleToggle}
            className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <div className="flex-1">
            <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {task.description}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

TaskCard.displayName = 'TaskCard';
```

### Custom Performance Hooks
```typescript
// hooks/usePerformance.ts
import { useEffect, useRef } from 'react';

export const usePerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times in ${renderTime.toFixed(2)}ms`);
    }

    startTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
    measureRender: (callback: () => void) => {
      const start = performance.now();
      callback();
      const end = performance.now();
      return end - start;
    }
  };
};
```

## 🔒 Security

### Authentication Context
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, token } = response.data;
      
      // Store tokens
      localStorage.setItem('accessToken', token.accessToken);
      localStorage.setItem('refreshToken', token.refreshToken);
      
      setUser(userData);
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const response = await authAPI.refresh({ refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
    } catch (error) {
      logout();
      throw error;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.user);
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### API Interceptors
```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await authAPI.refresh({ refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

**Son Güncelleme**: 2024-12-19  
**Mimari Versiyon**: 1.0.0  
**Durum**: ✅ Production Ready 