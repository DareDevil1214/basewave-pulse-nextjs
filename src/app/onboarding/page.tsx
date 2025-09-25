'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Building2, Tag, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { getCurrentBranding } from '@/lib/branding';
import { toast } from 'sonner';

interface OnboardingData {
  businessName: string;
  businessDescription: string;
  mainKeywords: string;
  businessLogo: File | null;
}

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<OnboardingData>({
    businessName: '',
    businessDescription: '',
    mainKeywords: '',
    businessLogo: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleInputChange = (field: keyof OnboardingData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputChange('businessLogo', file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessName || !formData.businessDescription || !formData.mainKeywords) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement API call to update business data
      // For now, just update localStorage and redirect
      const updatedUserData = {
        ...JSON.parse(localStorage.getItem('user_data') || '{}'),
        businessName: formData.businessName,
        description: formData.businessDescription,
        mainKeywords: formData.mainKeywords,
        onboardingCompleted: true
      };
      
      localStorage.setItem('user_data', JSON.stringify(updatedUserData));
      
      toast.success('Business setup completed!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating business data:', error);
      toast.error('Failed to update business data');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Welcome to {getCurrentBranding().name}!
          </CardTitle>
          <CardDescription className="text-lg">
            Let's set up your business profile to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-medium">
                Business Name *
              </Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Enter your business name"
                required
                className="w-full"
              />
            </div>

            {/* Business Description */}
            <div className="space-y-2">
              <Label htmlFor="businessDescription" className="text-sm font-medium">
                Business Description *
              </Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                placeholder="Describe what your business does..."
                rows={4}
                required
                className="w-full"
              />
            </div>

            {/* Main Keywords */}
            <div className="space-y-2">
              <Label htmlFor="mainKeywords" className="text-sm font-medium">
                Main Keywords *
              </Label>
              <Input
                id="mainKeywords"
                value={formData.mainKeywords}
                onChange={(e) => handleInputChange('mainKeywords', e.target.value)}
                placeholder="e.g., digital marketing, web design, consulting"
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Separate multiple keywords with commas
              </p>
            </div>

            {/* Business Logo */}
            <div className="space-y-2">
              <Label htmlFor="businessLogo" className="text-sm font-medium">
                Business Logo
              </Label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    id="businessLogo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full"
                  />
                </div>
                {logoPreview && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Upload your business logo (optional)
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Setting up your business...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Setup
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
