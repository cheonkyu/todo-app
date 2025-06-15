import { useState } from 'react';
import { Calendar, Badge, Layout, Button, Drawer } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import TodoList from '../components/TodoList';
import TodoForm from '../components/TodoForm';
import { Todo } from '@todo-app/libs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogoutOutlined, PlusOutlined } from '@ant-design/icons';
import { getTodoStats, getTodosByDate, createTodo, updateTodo, deleteTodo } from '../api/todos';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccessToken } from '../utils/auth';
import { useAuthStore } from '../stores/authStore';

const { Sider, Content } = Layout;

const TodoPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDate = searchParams.get('date') ? dayjs(searchParams.get('date')) : dayjs();
  const [selectedDate, setSelectedDate] = useState<Dayjs>(initialDate);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const queryClient = useQueryClient();

  // Query for fetching calendar stats
  const { data: todoStats = [] } = useQuery({
    queryKey: ['todoStats'],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) {
        logout();
        navigate('/login', { replace: true });
        throw new Error('No access token available');
      }
      const response = await getTodoStats();
      return response.data;
    },
  });

  // Query for fetching todos for selected date
  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['todos', selectedDate.format('YYYY-MM-DD')],
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) {
        logout();
        navigate('/login', { replace: true });
        throw new Error('No access token available');
      }
      const response = await getTodosByDate(selectedDate.format('YYYY-MM-DD'));
      return response.data;
    },
  });

  // Mutations for todo operations
  const createTodoMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todoStats'] });
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, todo }: { id: string; todo: Partial<Todo> }) => updateTodo(id, todo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todoStats'] });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todoStats'] });
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
    setSearchParams({ date: date.format('YYYY-MM-DD') });
  };

  const handlePanelChange = (date: Dayjs) => {
    setSelectedDate(date);
    setSearchParams({ date: date.format('YYYY-MM-DD') });
  };

  const handleAddOrUpdateTodo = async (todo: Todo) => {
    try {
      if (editingTodo) {
        await updateTodoMutation.mutateAsync({ id: todo.id, todo });
      } else {
        await createTodoMutation.mutateAsync(todo);
      }
      setIsDrawerOpen(false);
      setEditingTodo(null);
    } catch {
      // Error is handled by axios interceptor
    }
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsDrawerOpen(true);
  };

  const handleToggleTodo = async (todoId: string) => {
    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo) return;
      await updateTodoMutation.mutateAsync({
        id: todoId,
        todo: { completed: !todo.completed }
      });
    } catch {
      // Error is handled by axios interceptor
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      await deleteTodoMutation.mutateAsync(todoId);
    } catch {
      // Error is handled by axios interceptor
    }
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setEditingTodo(null);
  };

  const dateCellRender = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    const todayStats = todoStats.find(stat => stat.date === dateStr);

    if (!todayStats || todayStats.totalCount === 0) return null;

    return (
      <div className="todo-badges">
        <Badge
          count={todayStats.totalCount}
          style={{
            backgroundColor: todayStats.incompleteCount > 0 ? '#1890ff' : '#52c41a',
          }}
        />
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={400}
        style={{
          background: '#fff',
          padding: '24px',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          height: '100vh',
          position: 'fixed',
          left: 0,
          overflowY: 'auto',
        }}
      >
        <div style={{ marginBottom: '24px', textAlign: 'right' }}>
          <LogoutOutlined
            onClick={handleLogout}
            style={{ fontSize: '20px', cursor: 'pointer', color: '#1890ff' }}
          />
        </div>
        <Calendar
          fullscreen={false}
          onSelect={handleDateSelect}
          onPanelChange={handlePanelChange}
          dateCellRender={dateCellRender}
          value={selectedDate}
          style={{ height: 'calc(100vh - 100px)' }}
        />
      </Sider>
      <Layout style={{ marginLeft: 400, minHeight: '100vh' }}>
        <Content style={{ margin: '24px', background: '#fff', padding: '24px' }}>
          <TodoList
            todos={todos}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
            onEditTodo={handleEditTodo}
            loading={isLoading}
          />
        </Content>
      </Layout>
      <Button
        type="primary"
        shape="circle"
        icon={<PlusOutlined />}
        size="large"
        onClick={() => setIsDrawerOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '50px',
          height: '50px',
        }}
      />
      <Drawer
        title={editingTodo ? '할 일 수정' : '새로운 할 일'}
        placement="bottom"
        onClose={handleDrawerClose}
        open={isDrawerOpen}
        height={300}
      >
        <TodoForm
          selectedDate={selectedDate}
          onAddTodo={handleAddOrUpdateTodo}
          editingTodo={editingTodo}
        />
      </Drawer>
    </Layout>
  );
};

export default TodoPage; 