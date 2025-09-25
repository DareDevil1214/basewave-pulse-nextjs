'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Users, CheckCircle, AlertCircle, Trash2, Eye, X } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  businessId: string;
  businessName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  logoUrl?: string;
}

interface UserData {
  user: User;
  subcollections: {
    blog_posts: any[];
    blogSchedules: any[];
    compBlogContent: any[];
    keyword_analyses: any[];
    best_keywords: any[];
    keyword_extractions: any[];
    keyword_rankings: any[];
    socialAgent_generatedPosts: any[];
    socialAgent_scheduledPosts: any[];
    socialAgent_publishedPosts: any[];
    documents: any[];
    documentChunks: any[];
    documentImages: any[];
    portalConfigs: any[];
  };
}

interface UserFormData {
  username: string;
  password: string;
  email: string;
  role: string;
}

export function AdminTab() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState<UserData | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(false);

  // User form state - simplified to only essential fields
  const [userForm, setUserForm] = useState<UserFormData>({
    username: '',
    password: '',
    email: '',
    role: 'user'
  });

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You need administrator privileges to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt_token');
      const response = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userForm.username || !userForm.password || !userForm.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (userForm.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: userForm.username,
          password: userForm.password,
          email: userForm.email,
          role: userForm.role
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User created successfully!');
        setUserForm({
          username: '',
          password: '',
          email: '',
          role: 'user'
        });
        loadUsers(); // Reload users list
      } else {
        toast.error(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setUserForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User deleted successfully!');
        loadUsers(); // Reload users list
        setSelectedUserData(null); // Clear selected user data
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      setLoadingUserData(true);
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`/api/auth/users/${userId}/data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSelectedUserData(data.data);
      } else {
        toast.error('Failed to load user data');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoadingUserData(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Manage users and their access</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create User Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New User
            </CardTitle>
            <CardDescription>
              Create a new user account. They will set up their business details on first login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={userForm.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={userForm.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating User...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create User
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Existing Users
            </CardTitle>
            <CardDescription>
              All users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading users...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No users found</p>
                <p className="text-sm">Create your first user to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((userItem) => (
                  <div
                    key={userItem.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{userItem.username}</span>
                        <Badge variant={userItem.role === 'admin' ? 'default' : 'secondary'}>
                          {userItem.role}
                        </Badge>
                        {!userItem.isActive && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{userItem.email}</p>
                      <p className="text-xs text-gray-500">
                        Business: {userItem.businessName || 'Not set'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {userItem.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadUserData(userItem.id)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(userItem.id, userItem.username)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Data Display */}
      {selectedUserData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Data: {selectedUserData.user.username}
                </CardTitle>
                <CardDescription>
                  Business data and subcollections for {selectedUserData.user.businessName}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUserData(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingUserData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading user data...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">Username</h4>
                    <p className="text-sm text-gray-600">{selectedUserData.user.username}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">Email</h4>
                    <p className="text-sm text-gray-600">{selectedUserData.user.email}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">Role</h4>
                    <Badge variant={selectedUserData.user.role === 'admin' ? 'default' : 'secondary'}>
                      {selectedUserData.user.role}
                    </Badge>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">Business Name</h4>
                    <p className="text-sm text-gray-600">{selectedUserData.user.businessName}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">Status</h4>
                    <Badge variant={selectedUserData.user.isActive ? 'default' : 'destructive'}>
                      {selectedUserData.user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">Created</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedUserData.user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Subcollections Data */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Subcollections Data</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(selectedUserData.subcollections).map(([collectionName, documents]) => (
                      <div key={collectionName} className="p-4 border rounded-lg">
                        <h5 className="font-medium text-gray-900 capitalize mb-2">
                          {collectionName.replace(/_/g, ' ')}
                        </h5>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {documents.length} documents
                          </Badge>
                          {documents.length > 0 && (
                            <span className="text-xs text-gray-500">
                              Latest: {new Date(documents[0]?.createdAt || documents[0]?.updatedAt || Date.now()).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {documents.length > 0 && (
                          <div className="mt-2 max-h-32 overflow-y-auto">
                            <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              {JSON.stringify(documents.slice(0, 2), null, 2)}
                            </pre>
                            {documents.length > 2 && (
                              <p className="text-xs text-gray-500 mt-1">
                                ... and {documents.length - 2} more
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> Users will set up their business details (name, description, logo, etc.) 
          during their first login. This admin panel only creates the basic user account with username, 
          password, email, and role.
        </AlertDescription>
      </Alert>
    </div>
  );
}