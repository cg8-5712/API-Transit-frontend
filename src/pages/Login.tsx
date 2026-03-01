import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
  };
}

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await axios.post<LoginResponse>('/auth/login', { password });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data.token) {
        localStorage.setItem('admin_token', data.data.token);
        navigate('/');
      }
    },
    onError: () => {
      setError('密码错误，请重试');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password) {
      setError('请输入密码');
      return;
    }
    loginMutation.mutate(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F6] via-white to-[#F5DBDD]/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl gradient-pink shadow-lg flex items-center justify-center">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#F5DBDD] to-[#EDC3CC] bg-clip-text text-transparent">
              API Transit
            </CardTitle>
            <CardDescription className="text-base mt-2">管理员登录</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="text-sm font-medium block mb-2">
                管理员密码
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入管理员密码"
                className="border-[#F5DBDD]/50 focus:border-[#EDC3CC] focus:ring-[#EDC3CC]/20"
                disabled={loginMutation.isPending}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full shadow-lg"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? '登录中...' : '登录'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>默认密码请查看 .env 文件中的 ADMIN_SECRET</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
