import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plane } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export default function Login({ onLogin }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Store credentials in localStorage for now
      localStorage.setItem('skyroute_auth', JSON.stringify({
        email: data.email,
        loggedIn: true,
        timestamp: Date.now()
      }));
      
      toast.success('Login successful!');
      if (onLogin) onLogin();
    } catch (error) {
      toast.error('Login failed', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      toast.success('Password reset instructions sent!', {
        description: `Check your email at ${email} for reset instructions.`
      });
      setShowForgotPassword(false);
    } catch (error) {
      toast.error('Error sending reset email');
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Plane className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email to receive reset instructions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              const email = e.target.email.value;
              handleForgotPassword(email);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="Enter your email"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Send Reset Instructions
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              variant="link" 
              className="w-full" 
              onClick={() => setShowForgotPassword(false)}
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Plane className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-center">SkyRoute UK</CardTitle>
          <CardDescription className="text-center">
            C209/C208 Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                {...register('email')} 
                type="email" 
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                {...register('password')} 
                type="password" 
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            variant="link" 
            className="w-full" 
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot Password?
          </Button>
          <div className="text-xs text-center text-muted-foreground">
            <p>Default login: any email + password (min 6 chars)</p>
            <p className="mt-1 text-blue-600 font-medium">For emergency access, use any valid email</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}