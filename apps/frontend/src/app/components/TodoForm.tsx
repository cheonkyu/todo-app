import { Form, Input, Button } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { useEffect } from 'react';
import { Todo } from '../@todo-app/libs';

interface TodoFormProps {
  selectedDate: Dayjs;
  onAddTodo: (todo: Todo) => void;
  editingTodo?: Todo | null;
}

const TodoForm = ({ selectedDate, onAddTodo, editingTodo }: TodoFormProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingTodo) {
      form.setFieldsValue({
        title: editingTodo.title,
        description: editingTodo.description,
      });
    } else {
      form.resetFields();
    }
  }, [editingTodo, form]);

  const handleSubmit = (values: { title: string; description?: string }) => {
    const todo: Todo = editingTodo
      ? {
          ...editingTodo,
          title: values.title,
          description: values.description,
        }
      : {
          title: values.title,
          description: values.description,
          completed: false,
          date: selectedDate.format('YYYY-MM-DD'),
          userId: '1', // 실제로는 로그인한 사용자의 ID를 사용
        };

    onAddTodo(todo);
    form.resetFields();
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        name="title"
        rules={[{ required: true, message: '할 일을 입력해주세요.' }]}
      >
        <Input
          placeholder="할 일을 입력하세요"
          suffix={
            <Button
              type="primary"
              htmlType="submit"
              icon={editingTodo ? <SaveOutlined /> : <PlusOutlined />}
              style={{ marginRight: '-7px' }}
            />
          }
        />
      </Form.Item>
      <Form.Item name="description">
        <Input.TextArea
          placeholder="설명을 입력하세요 (선택사항)"
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
      </Form.Item>
    </Form>
  );
};

export default TodoForm; 