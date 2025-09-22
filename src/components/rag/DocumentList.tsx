'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  Trash2, 
  Eye, 
  Download,
  RefreshCw,
  Calendar,
  Hash,
  File
} from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  filename: string;
  portal: string;
  fileType: string;
  uploadDate: string | any; // Can be string, Firestore timestamp, or Date object
  status: string;
  fileSize: number;
  chunkCount: number;
  totalTextLength: number;
}

interface DocumentListProps {
  documents: Document[];
  portal: string;
  isLoading: boolean;
  onDocumentDeleted: (documentId: string) => void;
  onRefresh: () => void;
}

export default function DocumentList({ 
  documents, 
  portal, 
  isLoading, 
  onDocumentDeleted, 
  onRefresh 
}: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    setDeletingId(documentId);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';
      const response = await fetch(`${backendUrl}/api/rag/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Document deleted successfully');
        onDocumentDeleted(documentId);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Delete failed');
      }
    } catch (error) {
      toast.error(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'md':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'txt':
        return <FileText className="w-5 h-5 text-gray-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateInput: any) => {
    let date: Date;
    
    // Debug: Log the input to see what format we're getting
    console.log('📅 Date input:', dateInput, 'Type:', typeof dateInput);
    
    // Handle different date formats
    if (typeof dateInput === 'string') {
      // Should be ISO string from backend
      date = new Date(dateInput);
    } else if (dateInput && typeof dateInput === 'object') {
      // Fallback for Firestore timestamp objects (if backend doesn't convert)
      if (dateInput.seconds !== undefined) {
        date = new Date(dateInput.seconds * 1000);
      } else if (dateInput._seconds !== undefined) {
        date = new Date(dateInput._seconds * 1000);
      } else if (dateInput.toDate && typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
      } else {
        console.log('📅 Object structure:', Object.keys(dateInput));
        date = new Date(dateInput);
      }
    } else {
      date = new Date();
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('❌ Invalid date:', dateInput);
      return 'Invalid date';
    }
    
    const formatted = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log('📅 Formatted date:', formatted);
    return formatted;
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents ({portal})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents ({documents.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No documents uploaded yet</p>
            <p className="text-sm">Upload your first document to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((document) => (
              <div
                key={document.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getFileIcon(document.fileType)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {document.filename}
                        </h4>
                        {getStatusBadge(document.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(document.uploadDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <File className="w-4 h-4" />
                          <span>{formatFileSize(document.fileSize)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Hash className="w-4 h-4" />
                          <span>{document.chunkCount} chunks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs">
                            {document.totalTextLength.toLocaleString()} chars
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="View document details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Download document"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(document.id)}
                      disabled={deletingId === document.id}
                      title="Delete document"
                    >
                      {deletingId === document.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
