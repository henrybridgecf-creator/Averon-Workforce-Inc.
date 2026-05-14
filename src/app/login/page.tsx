'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, MapPin } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, updateUserLocation } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get user location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Get address from coordinates (reverse geocoding)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const address = data.address?.city || data.address?.country || 'Unknown';
            
            localStorage.setItem(
              'userLocation',
              JSON.stringify({ latitude, longitude, address })
            );
          } catch (error) {
            console.error('Error getting location:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await login(formData.email, formData.password);

      // Update location after login
      const location = localStorage.getItem('userLocation');
      if (location) {
        const { latitude, longitude, address } = JSON.parse(location);
        await updateUserLocation(latitude, longitude, address);
      }

      toast({
        title: 'Success',
        description: 'Logged in successfully! Redirecting...',
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      toast({
        title: 'Login Error',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] text-foreground flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-primary p-2 rounded-lg">
              <span className="text-2xl font-bold text-white">💰</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">AverPay</h1>
              <p className="text-xs text-primary">by Averon Workforce</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mt-6">Welcome Back</h2>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Location Info */}
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Your location will be recorded upon login for security and admin notifications.
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-sm mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
}
