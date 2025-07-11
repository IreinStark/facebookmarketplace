"use client"

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle, Camera } from 'lucide-react';

interface MockPhoto {
  id: string;
  url: string;
  fileName: string;
  size: number;
  uploadedAt: Date;
  userId: string;
}

interface PhotoUploadMockProps {
  onPhotosUploaded: (photos: MockPhoto[]) => void;
  userId: string;
  productId?: string;
  maxFiles?: number;
  className?: string;
}

interface UploadState {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  photo?: MockPhoto;
  error?: string;
  url?: string;
}

export function PhotoUploadMock({ 
  onPhotosUploaded, 
  userId, 
  productId, 
  maxFiles = 5,
  className = ""
}: PhotoUploadMockProps) {
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [globalError, setGlobalError] = useState<string>("");

  const createMockPhoto = (file: File): MockPhoto => {
    // Create a local URL for the file
    const url = URL.createObjectURL(file);
    
    return {
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      fileName: file.name,
      size: file.size,
      uploadedAt: new Date(),
      userId
    };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setGlobalError("");
    
    // Validate file count
    const totalFiles = uploads.length + acceptedFiles.length;
    if (totalFiles > maxFiles) {
      setGlobalError(`Maximum ${maxFiles} files allowed. You're trying to upload ${totalFiles} files.`);
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    for (const file of acceptedFiles) {
      if (!file.type.startsWith('image/')) {
        setGlobalError(`${file.name} is not an image file.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setGlobalError(`${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      validFiles.push(file);
    }

    // Initialize upload states
    const newUploads: UploadState[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
      url: URL.createObjectURL(file)
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Simulate upload process
    const uploadPromises = validFiles.map(async (file, index) => {
      const uploadIndex = uploads.length + index;
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploads(prev => prev.map((upload, i) => 
          i === uploadIndex && upload.status === 'uploading'
            ? { ...upload, progress: Math.min(upload.progress + 20, 100) }
            : upload
        ));
      }, 100);

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      clearInterval(progressInterval);
      
      const photo = createMockPhoto(file);
      
      setUploads(prev => prev.map((upload, i) => 
        i === uploadIndex
          ? { ...upload, progress: 100, status: 'success' as const, photo }
          : upload
      ));

      return photo;
    });

    try {
      const results = await Promise.all(uploadPromises);
      onPhotosUploaded(results);
    } catch (error) {
      console.error('Upload error:', error);
    }
  }, [uploads.length, maxFiles, userId, onPhotosUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: maxFiles - uploads.length,
    disabled: uploads.length >= maxFiles
  });

  const removeUpload = (index: number) => {
    const upload = uploads[index];
    if (upload && upload.url) {
      URL.revokeObjectURL(upload.url);
    }
    setUploads(prev => prev.filter((_, i) => i !== index));
  };

  const retryUpload = async (index: number) => {
    const upload = uploads[index];
    if (!upload || upload.status !== 'error') return;

    setUploads(prev => prev.map((u, i) => 
      i === index ? { ...u, status: 'uploading', progress: 0, error: undefined } : u
    ));

    // Simulate retry
    const progressInterval = setInterval(() => {
      setUploads(prev => prev.map((u, i) => 
        i === index && u.status === 'uploading'
          ? { ...u, progress: Math.min(u.progress + 20, 100) }
          : u
      ));
    }, 100);

    await new Promise(resolve => setTimeout(resolve, 500));
    
    clearInterval(progressInterval);
    
    const photo = createMockPhoto(upload.file);
    
    setUploads(prev => prev.map((u, i) => 
      i === index ? { ...u, progress: 100, status: 'success', photo } : u
    ));

    onPhotosUploaded([photo]);
  };

  const hasSuccessfulUploads = uploads.some(upload => upload.status === 'success');

  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      {/* Upload Area */}
      {uploads.length < maxFiles && (
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center cursor-pointer transition-colors touch-manipulation
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 active:border-blue-500'
                }
              `}
            >
              <input {...getInputProps()} />
              
              {/* Mobile-first design with responsive icons */}
              <div className="flex flex-col items-center">
                <div className="mb-3 sm:mb-4">
                  {isDragActive ? (
                    <Upload className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto text-blue-500 animate-bounce" />
                  ) : (
                    <div className="relative">
                      <Camera className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto text-gray-400" />
                      <Upload className="h-4 w-4 sm:h-5 sm:w-5 absolute -top-1 -right-1 text-blue-500" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-sm sm:text-base lg:text-lg font-medium">
                    {isDragActive ? 'Drop photos here' : 'Upload Photos'}
                  </p>
                  
                  <p className="text-xs sm:text-sm text-gray-500 px-2">
                    <span className="hidden sm:inline">Drag and drop images here, or </span>
                    <span className="sm:hidden">Tap to </span>
                    <span className="hidden sm:inline">click to </span>
                    select files
                  </p>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">
                      Max {maxFiles} files • 10MB each
                    </p>
                    <p className="text-xs text-gray-400 hidden sm:block">
                      JPG, PNG, GIF, WebP supported
                    </p>
                    <p className="text-xs text-blue-500 mt-2">
                      Demo Mode: Photos stored locally
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="mt-3 sm:mt-4 text-sm sm:text-base px-4 sm:px-6 py-2 touch-manipulation"
                  type="button"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Global Error */}
      {globalError && (
        <Alert variant="destructive" className="mx-2 sm:mx-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{globalError}</AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between px-2 sm:px-0">
            <h3 className="font-medium text-sm sm:text-base">
              Uploads
            </h3>
            <span className="text-xs sm:text-sm text-gray-500">
              {uploads.filter(u => u.status === 'success').length}/{uploads.length}
            </span>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {uploads.map((upload, index) => (
              <Card key={index} className="w-full">
                <CardContent className="p-2 sm:p-3 lg:p-4">
                  <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                    {/* File Preview - Responsive sizing */}
                    <div className="flex-shrink-0">
                      {upload.url ? (
                        <img 
                          src={upload.url} 
                          alt={upload.file.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gray-100 dark:bg-gray-800 rounded border flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* File Info - Responsive text and spacing */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-medium text-xs sm:text-sm lg:text-base truncate">{upload.file.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {(upload.file.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                      
                      {/* Progress Bar */}
                      {upload.status === 'uploading' && (
                        <div className="space-y-1">
                          <Progress value={upload.progress} className="h-1.5 sm:h-2" />
                          <p className="text-xs text-gray-500">{upload.progress}%</p>
                        </div>
                      )}
                      
                      {/* Error Message */}
                      {upload.status === 'error' && upload.error && (
                        <p className="text-xs sm:text-sm text-red-500 break-words">{upload.error}</p>
                      )}
                    </div>

                    {/* Status Icon and Actions - Mobile optimized */}
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                      {upload.status === 'success' && (
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      )}
                      
                      {upload.status === 'error' && (
                        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retryUpload(index)}
                            className="text-xs px-2 py-1 h-7 sm:h-8 touch-manipulation"
                          >
                            Retry
                          </Button>
                          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mx-auto sm:mx-0" />
                        </div>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeUpload(index)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 touch-manipulation"
                        title="Remove"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {hasSuccessfulUploads && (
        <Alert className="mx-2 sm:mx-0">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {uploads.filter(u => u.status === 'success').length} photo(s) uploaded successfully!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}