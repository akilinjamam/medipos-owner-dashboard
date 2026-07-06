import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { loggedIn } from '@/features/auth/authSlice';
import { useLoginMutation } from '@/services/adminApi';
import { getErrorMessage } from '@/lib/apiError';
import { copyrightLine, PRODUCT_NAME } from '@/lib/company';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  if (token) return <Navigate to="/" replace />;

  const onSubmit = async (values: LoginForm) => {
    try {
      const res = await login(values).unwrap();
      dispatch(loggedIn({ token: res.accessToken, email: res.email }));
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Login failed'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-primary" />
            <CardTitle>{PRODUCT_NAME} Owner Console</CardTitle>
            <CardDescription>Platform administration — authorized access only</CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="username" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground/70">{copyrightLine()}</p>
      </div>
    </div>
  );
}
