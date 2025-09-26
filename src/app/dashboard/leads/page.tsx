'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, Calendar, Building, MoreVertical, Trash2, CheckCircle, XCircle, Clock, Star, UserCheck } from 'lucide-react';
// Note: Lead management will be handled through backend API
// import { fetchLeadsFromFirebase, updateLeadStatus, deleteLead } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Lead {
  id: string;
  email: string;
  phoneNumber?: string;
  name?: string;
  portal: string;
  createdAt: any; // Firestore Timestamp or string
  articleId?: string;
  articleTitle?: string;
  status?: 'potential' | 'contacted' | 'qualified' | 'not-interested' | 'converted' | 'unqualified';
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingLeads, setDeletingLeads] = useState<Set<string>>(new Set());
  const [updatingLeads, setUpdatingLeads] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      // Mock data for now - will be replaced with backend API call
      const leadsData: Lead[] = [];
      
      // Add default status to leads that don't have one
      // Firebase already sorts by createdAt (newest first)
      const processedLeads = leadsData.map(lead => ({
        ...lead,
        status: lead.status || 'potential'
      }));
      
      setLeads(processedLeads);
    } catch (err) {
      setError('Failed to fetch leads');
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter leads based on status filter
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredLeads(leads);
    } else {
      setFilteredLeads(leads.filter(lead => lead.status === statusFilter));
    }
  }, [leads, statusFilter]);

  const formatDate = (dateInput: any) => {
    let date: Date;
    
    // Handle Firestore Timestamp
    if (dateInput && typeof dateInput === 'object' && dateInput.toDate) {
      date = dateInput.toDate();
    } else if (dateInput && typeof dateInput === 'object' && dateInput.seconds) {
      // Handle Firestore Timestamp with seconds
      date = new Date(dateInput.seconds * 1000);
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      return 'Invalid Date';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPortalDisplayName = (portal: string) => {
    const portalNames: { [key: string]: string } = {
      'eliteequilibrium': 'Elite Equilibrium',
      'eternalelite': 'Eternal Elite',
      'neovibemag': 'Neo Vibe Mag'
    };
    return portalNames[portal] || portal;
  };

  const getStatusDisplayInfo = (status: string) => {
    const statusConfig: { [key: string]: { label: string; color: string; bgColor: string; icon: React.ReactNode } } = {
      'potential': {
        label: 'Potential',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: <Star className="w-3 h-3" />
      },
      'contacted': {
        label: 'Contacted',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: <Clock className="w-3 h-3" />
      },
      'qualified': {
        label: 'Qualified',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: <CheckCircle className="w-3 h-3" />
      },
      'not-interested': {
        label: 'Not Interested',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: <XCircle className="w-3 h-3" />
      },
      'converted': {
        label: 'Converted',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        icon: <UserCheck className="w-3 h-3" />
      },
      'unqualified': {
        label: 'Unqualified',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        icon: <XCircle className="w-3 h-3" />
      }
    };
    
    return statusConfig[status] || statusConfig['potential'];
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdatingLeads(prev => new Set(prev).add(leadId));
    
    try {
      // Optimistic update
      setLeads(prev => 
        prev.map(lead => 
          lead.id === leadId 
            ? { ...lead, status: newStatus as Lead['status'] }
            : lead
        )
      );
      
      // Update in Firebase
      // Mock implementation - will be replaced with backend API call
      console.log(`Updating lead ${leadId} status to ${newStatus}`);
      
      // Show success notification
      setNotification({ type: 'success', message: `Lead status updated to ${newStatus}` });
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      console.error('Error updating lead status:', error);
      // Revert optimistic update on error
      setLeads(prev => 
        prev.map(lead => 
          lead.id === leadId 
            ? { ...lead, status: 'potential' as Lead['status'] }
            : lead
        )
      );
      // Show error notification
      setNotification({ type: 'error', message: 'Failed to update lead status. Please try again.' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setUpdatingLeads(prev => {
        const newSet = new Set(prev);
        newSet.delete(leadId);
        return newSet;
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    // Add confirmation dialog
    if (!window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return;
    }
    
    setDeletingLeads(prev => new Set(prev).add(leadId));
    
    try {
      // Delete from Firebase
      // Mock implementation - will be replaced with backend API call
      console.log(`Deleting lead ${leadId}`);
      
      // Remove from local state
      setLeads(prev => prev.filter(lead => lead.id !== leadId));
      
      // Show success notification
      setNotification({ type: 'success', message: 'Lead deleted successfully' });
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      console.error('Error deleting lead:', error);
      // Show error notification
      setNotification({ type: 'error', message: 'Failed to delete lead. Please try again.' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setDeletingLeads(prev => {
        const newSet = new Set(prev);
        newSet.delete(leadId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Leads</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchLeads}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-300 text-green-800' 
            : 'bg-red-100 border border-red-300 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Leads</h1>
        <p className="text-gray-600 text-base md:text-lg">Manage and track leads from all portals</p>
      </div>

                     {/* Stats */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
         <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
           <div className="flex items-center gap-2 md:gap-3">
             <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
               <Users className="w-4 h-4 md:w-6 md:h-6 text-gray-700" />
             </div>
             <div>
               <p className="text-xs md:text-sm text-gray-600">Total Leads</p>
               <p className="text-lg md:text-2xl font-bold text-gray-900">{leads.length}</p>
             </div>
           </div>
         </div>
         
         <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
           <div className="flex items-center gap-2 md:gap-3">
             <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
               <Mail className="w-4 h-4 md:w-6 md:h-6 text-gray-700" />
             </div>
             <div>
               <p className="text-xs md:text-sm text-gray-600">With Email</p>
               <p className="text-lg md:text-2xl font-bold text-gray-900">
                 {leads.filter(lead => lead.email).length}
               </p>
             </div>
           </div>
         </div>
         
         <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
           <div className="flex items-center gap-2 md:gap-3">
             <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
               <Phone className="w-4 h-4 md:w-6 md:h-6 text-gray-700" />
             </div>
             <div>
               <p className="text-xs md:text-sm text-gray-600">With Phone</p>
               <p className="text-lg md:text-2xl font-bold text-gray-900">
                 {leads.filter(lead => lead.phoneNumber).length}
               </p>
             </div>
           </div>
         </div>

         <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
           <div className="flex items-center gap-2 md:gap-3">
             <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
               <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-gray-700" />
             </div>
             <div>
               <p className="text-xs md:text-sm text-gray-600">Qualified</p>
               <p className="text-lg md:text-2xl font-bold text-gray-900">
                 {leads.filter(lead => lead.status === 'qualified').length}
               </p>
             </div>
           </div>
         </div>
       </div>

             {/* Leads Table - Displayed from Latest to Oldest */}
       <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
         <div className="border-b border-gray-200 px-4 md:px-6 py-4">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div>
               <h3 className="text-base md:text-lg font-semibold text-gray-900">
                 {statusFilter === 'all' ? 'All Leads' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Leads`}
               </h3>
               <p className="text-xs md:text-sm text-gray-500 mt-1">
                 Showing {filteredLeads.length} of {leads.length} total leads (Latest first)
               </p>
             </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-xs md:text-sm text-gray-600">Filter by status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="potential">Potential</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="not-interested">Not Interested</option>
                <option value="unqualified">Unqualified</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="text-xs text-gray-500 px-4 py-2 bg-gray-50 border-b border-gray-200 md:hidden">
            💡 Scroll horizontally to see all columns on mobile
          </div>
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Portal
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                                 <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Date
                 </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead, index) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 md:px-6 py-4">
                    <div className="space-y-1">
                      {lead.name && (
                        <p className="text-sm font-medium text-gray-900 break-words">{lead.name}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="break-all">{lead.email}</span>
                      </div>
                      {lead.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span className="break-all">{lead.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900 break-words">
                        {getPortalDisplayName(lead.portal)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="hidden md:table-cell px-6 py-4">
                    {lead.articleTitle ? (
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 font-medium break-words leading-relaxed hyphens-auto" title={lead.articleTitle}>
                          {lead.articleTitle.length > 80 
                            ? `${lead.articleTitle.substring(0, 80)}...` 
                            : lead.articleTitle
                          }
                        </p>
                        <p className="text-xs text-gray-500 break-all mt-1 font-mono">{lead.articleId}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No article</span>
                    )}
                  </td>
                  
                  <td className="px-3 md:px-6 py-4">
                    <div className="flex items-center gap-2">
                      {lead.status ? (
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusDisplayInfo(lead.status).bgColor} ${getStatusDisplayInfo(lead.status).color}`}>
                          {getStatusDisplayInfo(lead.status).icon}
                          <span className="hidden sm:inline">{getStatusDisplayInfo(lead.status).label}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          <Star className="w-3 h-3" />
                          <span className="hidden sm:inline">Potential</span>
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="break-words">{formatDate(lead.createdAt)}</span>
                    </div>
                  </td>

                  <td className="px-3 md:px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Lead Status</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(lead.id, 'potential')}
                          disabled={updatingLeads.has(lead.id)}
                          className={lead.status === 'potential' ? 'bg-blue-50 text-blue-700' : ''}
                        >
                          <Star className="mr-2 h-4 w-4" />
                          Potential
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(lead.id, 'contacted')}
                          disabled={updatingLeads.has(lead.id)}
                          className={lead.status === 'contacted' ? 'bg-yellow-50 text-yellow-700' : ''}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Contacted
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(lead.id, 'qualified')}
                          disabled={updatingLeads.has(lead.id)}
                          className={lead.status === 'qualified' ? 'bg-green-50 text-green-700' : ''}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Qualified
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(lead.id, 'converted')}
                          disabled={updatingLeads.has(lead.id)}
                          className={lead.status === 'converted' ? 'bg-purple-50 text-purple-700' : ''}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Converted
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(lead.id, 'not-interested')}
                          disabled={updatingLeads.has(lead.id)}
                          className={lead.status === 'not-interested' ? 'bg-red-50 text-red-700' : ''}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Not Interested
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(lead.id, 'unqualified')}
                          disabled={updatingLeads.has(lead.id)}
                          className={lead.status === 'unqualified' ? 'bg-gray-50 text-gray-700' : ''}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Unqualified
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteLead(lead.id)}
                          disabled={deletingLeads.has(lead.id)}
                          className="text-red-600"
                        >
                          {deletingLeads.has(lead.id) ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete Lead
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {statusFilter === 'all' ? 'No leads yet' : `No leads with status "${statusFilter}"`}
            </h3>
            <p className="text-gray-500">
              {statusFilter === 'all' 
                ? 'Leads will appear here when visitors interact with your portals'
                : 'Try changing the status filter or check other statuses'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}