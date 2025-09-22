'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  FileText,
  MessageSquare,
  Settings,
  Users,
  Bot,
  Database
} from 'lucide-react';

// Components
import DocumentUpload from '../../../components/rag/DocumentUpload';
import DocumentList from '../../../components/rag/DocumentList';
import RAGChatbot from '../../../components/rag/RAGChatbot';
import { RAGHeader } from '../../../components/rag/RAGHeader';

interface Document {
  id: string;
  filename: string;
  portal: string;
  fileType: string;
  uploadDate: string;
  status: string;
  fileSize: number;
  chunkCount: number;
  totalTextLength: number;
}

const portals = [
  {
    id: 'newpeople',
    name: 'New People',
    description: 'AI-powered portfolio creation',
    icon: Users,
    color: 'from-emerald-500 to-emerald-700'
  }
];

export default function RAGDashboard() {
  const searchParams = useSearchParams();
  const selectedPortal = searchParams.get('portal') || 'newpeople';
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');

  // Fetch documents for selected portal
  const fetchDocuments = async (portal: string) => {
    setIsLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';
      const response = await fetch(`${backendUrl}/api/rag/documents/${portal}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.data || []);
      } else {
        const error = await response.json();
        console.error('Error fetching documents:', error.message || 'Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle document upload success
  const handleDocumentUploaded = () => {
    fetchDocuments(selectedPortal);
  };

  // Handle document deletion
  const handleDocumentDeleted = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  // Load documents when portal changes
  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments(selectedPortal);
    }
  }, [selectedPortal, activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full space-y-8">
        {/* Header */}
        <RAGHeader />

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
            <TabsTrigger 
              value="documents" 
              className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger 
              value="chatbot" 
              className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chatbot</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Upload Section */}
              <div className="xl:col-span-1">
                <DocumentUpload 
                  portal={selectedPortal}
                  onUploadSuccess={handleDocumentUploaded}
                />
              </div>

              {/* Document List */}
              <div className="xl:col-span-2">
                <DocumentList 
                  documents={documents}
                  portal={selectedPortal}
                  isLoading={isLoading}
                  onDocumentDeleted={handleDocumentDeleted}
                  onRefresh={() => fetchDocuments(selectedPortal)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Chatbot Tab */}
          <TabsContent value="chatbot" className="space-y-6">
            <RAGChatbot portal={selectedPortal} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* RAG Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    RAG System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-900">Chunk Size</label>
                      <p className="text-sm text-gray-600 mt-1">1000 characters per chunk</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-900">Chunk Overlap</label>
                      <p className="text-sm text-gray-600 mt-1">200 characters overlap</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-900">Max File Size</label>
                      <p className="text-sm text-gray-600 mt-1">10MB per document</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-900">Supported Formats</label>
                      <p className="text-sm text-gray-600 mt-1">PDF, Word, Markdown, Text</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Portal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    Portal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      {(() => {
                        const selectedPortalData = portals.find(p => p.id === selectedPortal);
                        return selectedPortalData && (
                          <>
                            <selectedPortalData.icon className="w-6 h-6 text-gray-700" />
                            <div>
                              <h3 className="font-semibold text-gray-900">{selectedPortalData.name}</h3>
                              <p className="text-sm text-gray-600">{selectedPortalData.description}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Documents:</span>
                        <span className="ml-2 text-gray-600">{documents.length}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="ml-2 text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}
