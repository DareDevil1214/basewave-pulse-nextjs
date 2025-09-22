'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit3, Send, Mail, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fetchReportingData, updateReportingEmails, updateLastWebhookTime } from '@/lib/firebase';
import { toast } from 'sonner';

interface EmailData {
  id: string;
  emails: string[];
}

export default function ReportingPage() {
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [editingEmail, setEditingEmail] = useState<{ index: number; value: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWebhookLoading, setIsWebhookLoading] = useState(false);
  const [lastWebhookTime, setLastWebhookTime] = useState<number>(0);
  const [webhookCooldown, setWebhookCooldown] = useState(0);

  const webhookUrl = 'https://workflowauto-7b65931ca9c4.herokuapp.com/webhook/6a134718-f7b7-44f2-8f5d-eaaeb876b2bc';

  // Load emails from Firebase on component mount
  useEffect(() => {
    loadEmails();
  }, []);

  // Handle webhook cooldown countdown
  useEffect(() => {
    if (webhookCooldown > 0) {
      const timer = setTimeout(() => {
        setWebhookCooldown(webhookCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [webhookCooldown]);

  const loadEmails = async () => {
    try {
      setIsLoading(true);
      const reportingData = await fetchReportingData();
      setEmails(reportingData.emails);
      setLastWebhookTime(reportingData.lastWebhookTime);
    } catch (error) {
      console.error('Error loading emails:', error);
      toast.error('Failed to load emails');
    } finally {
      setIsLoading(false);
    }
  };

  const saveEmailsToFirebase = async (updatedEmails: string[]) => {
    try {
      await updateReportingEmails(updatedEmails);
      return true;
    } catch (error) {
      console.error('Error saving emails:', error);
      toast.error('Failed to save emails');
      return false;
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addEmail = async () => {
    if (!newEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!validateEmail(newEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (emails.includes(newEmail.trim())) {
      toast.error('This email already exists');
      return;
    }

    const updatedEmails = [...emails, newEmail.trim()];
    const success = await saveEmailsToFirebase(updatedEmails);
    
    if (success) {
      setEmails(updatedEmails);
      setNewEmail('');
      toast.success('Email added successfully');
    }
  };

  const updateEmail = async (index: number, newValue: string) => {
    if (!newValue.trim()) {
      toast.error('Email cannot be empty');
      return;
    }

    if (!validateEmail(newValue.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (emails.some((email, i) => i !== index && email === newValue.trim())) {
      toast.error('This email already exists');
      return;
    }

    const updatedEmails = [...emails];
    updatedEmails[index] = newValue.trim();
    
    const success = await saveEmailsToFirebase(updatedEmails);
    
    if (success) {
      setEmails(updatedEmails);
      setEditingEmail(null);
      toast.success('Email updated successfully');
    }
  };

  const removeEmail = async (index: number) => {
    const updatedEmails = emails.filter((_, i) => i !== index);
    const success = await saveEmailsToFirebase(updatedEmails);
    
    if (success) {
      setEmails(updatedEmails);
      toast.success('Email removed successfully');
    }
  };

  const triggerWebhook = async () => {
    const now = Date.now();
    const timeSinceLastWebhook = now - lastWebhookTime;
    
    if (timeSinceLastWebhook < 5000) {
      const remainingTime = Math.ceil((5000 - timeSinceLastWebhook) / 1000);
      setWebhookCooldown(remainingTime);
      toast.error(`Please wait ${remainingTime} seconds before triggering again`);
      return;
    }

    try {
      setIsWebhookLoading(true);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trigger: true }),
      });

      if (response.ok) {
        const result = await response.json();
        setLastWebhookTime(now);
        
        // Save the timestamp to Firebase
        try {
          await updateLastWebhookTime(now);
        } catch (firebaseError) {
          console.error('Failed to save webhook time to Firebase:', firebaseError);
          // Don't show error to user as webhook was successful
        }
        
        toast.success(result.message || 'Webhook triggered successfully');
      } else {
        throw new Error('Failed to trigger webhook');
      }
    } catch (error) {
      console.error('Error triggering webhook:', error);
      toast.error('Failed to trigger webhook');
    } finally {
      setIsWebhookLoading(false);
    }
  };

  const canTriggerWebhook = webhookCooldown === 0;

  const refreshLastWebhookTime = async () => {
    try {
      const reportingData = await fetchReportingData();
      setLastWebhookTime(reportingData.lastWebhookTime);
      toast.success('Last webhook time refreshed');
    } catch (error) {
      console.error('Error refreshing webhook time:', error);
      toast.error('Failed to refresh webhook time');
    }
  };

    return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Reporting</h1>
        <p className="text-gray-600 text-base md:text-lg">Manage reporting emails and trigger n8n workflow webhooks for automated reporting.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Management Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden"
        >
          <div className="border-b border-gray-200 px-4 md:px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Email Management</h2>
                <p className="text-xs md:text-sm text-gray-500">Manage reporting email recipients</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={loadEmails}
                className="text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
            </div>
          </div>

          {/* Add New Email */}
          <div className="px-4 md:px-6 py-4">
            <div className="flex gap-3 mb-4">
              <Input
                type="email"
                placeholder="Enter email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && addEmail()}
              />
              <Button
                onClick={addEmail}
                disabled={!newEmail.trim() || !validateEmail(newEmail.trim())}
                className="bg-gray-700 hover:bg-gray-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Email List */}
            <div className="max-h-[320px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f3f4f6' }}>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 mt-2">Loading emails...</p>
                  </div>
                ) : emails.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No emails added yet</p>
                    <p className="text-sm">Add your first email address above</p>
                  </div>
                ) : (
                  emails.map((email, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      {editingEmail?.index === index ? (
                        <>
                          <Input
                            type="email"
                            value={editingEmail.value}
                            onChange={(e) => setEditingEmail({ ...editingEmail, value: e.target.value })}
                            className="flex-1"
                            onKeyPress={(e) => e.key === 'Enter' && updateEmail(index, editingEmail.value)}
                          />
                          <Button
                            size="sm"
                            onClick={() => updateEmail(index, editingEmail.value)}
                            className="bg-gray-700 hover:bg-gray-800 text-white"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingEmail(null)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="flex-1 text-sm font-medium">{email}</span>
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                            Active
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingEmail({ index, value: email })}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeEmail(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

              {/* Email Count */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Total emails: <span className="font-semibold text-gray-900">{emails.length}</span>
                  </p>
                  {emails.length > 5 && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      Scroll to see more
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

                    {/* Webhook Trigger Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            <div className="border-b border-gray-200 px-4 md:px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Send className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">Webhook Trigger</h2>
                  <p className="text-xs md:text-sm text-gray-500">Manually trigger the n8n workflow</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={refreshLastWebhookTime}
                  className="text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </Button>
              </div>
            </div>

            {/* Webhook URL Display */}
            <div className="px-4 md:px-6 py-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <div className="flex gap-2">
                <Input
                  value={webhookUrl}
                  readOnly
                  className="flex-1 bg-gray-50 text-gray-600"
                />
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(webhookUrl)}
                  className="whitespace-nowrap border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Copy
                </Button>
              </div>
            </div>

            {/* Trigger Button */}
            <div className="px-4 md:px-6 pb-4">
              <Button
                onClick={triggerWebhook}
                disabled={!canTriggerWebhook || isWebhookLoading}
                className={`w-full py-3 text-lg ${
                  canTriggerWebhook
                    ? 'bg-gray-700 hover:bg-gray-800 text-white'
                    : 'bg-gray-400 cursor-not-allowed text-white'
                }`}
              >
                {isWebhookLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Triggering...
                  </>
                ) : !canTriggerWebhook ? (
                  <>
                    <Clock className="w-5 h-5 mr-2" />
                    Wait {webhookCooldown}s
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Trigger Workflow
                  </>
                )}
              </Button>
            </div>

                                     {/* Status Information */}
            <div className="px-4 md:px-6 pb-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Rate limited to once every 5 seconds</span>
                </div>
                
                {lastWebhookTime > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>
                      Last triggered: {new Date(lastWebhookTime).toLocaleString()}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={refreshLastWebhookTime}
                      className="ml-auto text-blue-600 hover:text-blue-700 p-1 h-6 w-6"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </Button>
                  </div>
                )}
                
                {lastWebhookTime === 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>No webhooks triggered yet</span>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">How it works:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Add or remove email addresses for reporting</li>
                  <li>• Click "Trigger Workflow" to start the n8n automation</li>
                  <li>• The workflow will send reports to all configured emails</li>
                  <li>• Rate limited to prevent abuse</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
