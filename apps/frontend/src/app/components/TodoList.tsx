import { List, Checkbox, Button, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Todo } from '@todo-app/libs';

interface TodoListProps {
  todos: Todo[];
  onToggleTodo: (todoId: string) => Promise<void>;
  onDeleteTodo: (todoId: string) => Promise<void>;
  onEditTodo: (todo: Todo) => void;
  loading?: boolean;
}

const TodoList = ({ todos, onToggleTodo, onDeleteTodo, onEditTodo, loading }: TodoListProps) => {
  return (
    <List
      loading={loading}
      dataSource={todos}
      renderItem={(todo) => (
        <List.Item
          actions={[
            <Tooltip title="수정" key="edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEditTodo(todo)}
              />
            </Tooltip>,
            <Tooltip title="삭제" key="delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDeleteTodo(todo.id)}
              />
            </Tooltip>,
          ]}
        >
          <List.Item.Meta
            avatar={
              <Checkbox
                checked={todo.completed}
                onChange={() => onToggleTodo(todo.id)}
              />
            }
            title={todo.title}
            description={todo.description}
          />
        </List.Item>
      )}
    />
  );
};

export default TodoList; 