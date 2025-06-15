import { Form, Input, Button, Card } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/auth';
import { SignupForm } from '@todo-app/libs';
import { setTokens, setUser } from '../utils/auth';

const Signup = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: SignupForm) => {
    try {
      const { data } = await signup(values);
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      navigate('/', { replace: true });
    } catch {
      // Error is handled by axios interceptor
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
      <Card title="회원가입" style={{ width: 400 }}>
        <Form
          form={form}
          name="signup"
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
            name="name"
            rules={[{ required: true, message: '이름을 입력해주세요.' }]}
          >
            <Input placeholder="이름" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '비밀번호를 입력해주세요.' },
              { min: 6, message: '비밀번호는 6자 이상이어야 합니다.' }
            ]}
          >
            <Input.Password placeholder="비밀번호" />
          </Form.Item>

          <Form.Item
            name="passwordConfirm"
            dependencies={['password']}
            rules={[
              { required: true, message: '비밀번호를 다시 입력해주세요.' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="비밀번호 확인" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              회원가입
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Signup; 