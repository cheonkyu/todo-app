import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TodoPage from './pages/TodoPage';
import './styles/global.scss';
import { useEffect } from 'react';
import { isAuthenticated } from './utils/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

const App = () => {
  const authenticated = isAuthenticated();

  useEffect(() => {
    console.log('Authentication state:', authenticated);
  }, [authenticated]);

  return (
    <QueryClientProvider client={queryClient}>
        <Routes>
          <Route
            path="/login"
            element={
              authenticated ? (
                console.log('Redirecting to / from /login'),
                <Navigate to="/" replace />
              ) : (
                console.log('Rendering Login component'),
                <Login />
              )
            }
          />
          <Route
            path="/signup"
            element={authenticated ? <Navigate to="/" replace /> : <Signup />}
          />
          <Route
            path="/"
            // element={
            //   authenticated ? (
            //     console.log('Rendering TodoPage'),
            //     <TodoPage />
            //   ) : (
            //     console.log('Redirecting to /login from /'),
            //     <Navigate to="/login" replace />
            //   )
            // }
            element={<TodoPage />
            }
          />
        </Routes>
    </QueryClientProvider>
  );
};

export default App;
