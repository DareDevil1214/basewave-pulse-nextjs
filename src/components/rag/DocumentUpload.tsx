'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { 
  Upload, 
  FileText, 
  File, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploadProps {
  portal: string;
  onUploadSuccess: () => void;
}

interface UploadStatus {
  isUploading: boolean;
  progress: number;
  message: string;
  error?: string;
}

export default function DocumentUpload({ portal, onUploadSuccess }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    isUploading: false,
    progress: 0,
    message: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['.pdf', '.docx', '.md', '.txt'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!supportedFormats.includes(fileExtension)) {
      toast.error(`Unsupported file type. Supported: ${supportedFormats.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      toast.error('File size too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);
    setUploadStatus({
      isUploading: false,
      progress: 0,
      message: ''
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus({
      isUploading: true,
      progress: 0,
      message: 'Uploading document...'
    });

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('portal', portal);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadStatus(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';
      const response = await fetch(`${backendUrl}/api/rag/documents/upload`, {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const result = await response.json();
        setUploadStatus({
          isUploading: false,
          progress: 100,
          message: 'Document processed successfully!'
        });
        
        toast.success(`Document uploaded and processed into ${result.data.chunkCount} chunks`);
        setSelectedFile(null);
        onUploadSuccess();
        
        // Reset after 2 seconds
        setTimeout(() => {
          setUploadStatus({
            isUploading: false,
            progress: 0,
            message: ''
          });
        }, 2000);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
    } catch (error) {
      setUploadStatus({
        isUploading: false,
        progress: 0,
        message: 'Upload failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadStatus({
      isUploading: false,
      progress: 0,
      message: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'docx':
        return <FileText className="w-5 h-5 text-gray-600" />;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input */}
        <div className="space-y-2">
          <Label htmlFor="document">Select Document</Label>
          <Input
            id="document"
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.docx,.md,.txt"
            className="cursor-pointer"
          />
          <div className="text-xs text-gray-500">
            Supported formats: {supportedFormats.join(', ')} (Max: 10MB)
          </div>
        </div>

        {/* Selected File Display */}
        {selectedFile && (
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getFileIcon(selectedFile.name)}
                <div>
                  <div className="font-medium text-sm">{selectedFile.name}</div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadStatus.isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{uploadStatus.message}</span>
              <span>{uploadStatus.progress}%</span>
            </div>
            <Progress value={uploadStatus.progress} className="w-full" />
          </div>
        )}

        {/* Upload Status Message */}
        {uploadStatus.message && !uploadStatus.isUploading && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            uploadStatus.error 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {uploadStatus.error ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{uploadStatus.message}</span>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploadStatus.isUploading}
          className="w-full bg-black hover:bg-gray-800 text-white"
        >
          {uploadStatus.isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload & Process
            </>
          )}
        </Button>

        {/* Portal Info */}
        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            Uploading to: {portal}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
