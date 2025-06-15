import { Form, Input, Button, Card } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { LoginForm } from '@todo-app/libs';

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const auth = useAuthStore((state) => state.login);

  const onFinish = async (values: LoginForm) => {
    try {
      const { data } = await login(values); // 로그인 API
      auth(data.user, data.accessToken, data.refreshToken); // 상태 반영
      navigate('/', { replace: true }); // ✅ 즉시 반영됨
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card title="로그인" style={{ width: 400 }}>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '이메일을 입력해주세요.' },
              { type: 'email', message: '올바른 이메일 형식이 아닙니다.' }
            ]}
          >
            <Input placeholder="이메일" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
          >
            <Input.Password placeholder="비밀번호" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              로그인
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            계정이 없으신가요? <Link to="/signup">회원가입</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 