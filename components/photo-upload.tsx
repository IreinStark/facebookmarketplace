"use client"

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { uploadPhoto, type Photo } from '../lib/firebase-utils';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

interface PhotoUploadProps {
  onPhotosUploaded: (photos: Photo[]) => void;
  userId: string;
  productId?: string;
  maxFiles?: number;
  className?: string;
}

interface UploadState {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  photo?: Photo;
  error?: string;
}

export function PhotoUpload({ 
  onPhotosUploaded, 
  userId, 
  productId, 
  maxFiles = 5,
  className = ""
}: PhotoUploadProps) {
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [globalError, setGlobalError] = useState<string>("");

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
      status: 'uploading' as const
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Upload files
    const uploadPromises = validFiles.map(async (file, index) => {
      try {
        const uploadIndex = uploads.length + index;
        
        // Simulate progress (since Firebase doesn't provide real-time progress)
        const progressInterval = setInterval(() => {
          setUploads(prev => prev.map((upload, i) => 
            i === uploadIndex && upload.status === 'uploading'
              ? { ...upload, progress: Math.min(upload.progress + 10, 90) }
              : upload
          ));
        }, 200);

        const photo = await uploadPhoto(file, userId, productId);
        
        clearInterval(progressInterval);
        
        setUploads(prev => prev.map((upload, i) => 
          i === uploadIndex
            ? { ...upload, progress: 100, status: 'success' as const, photo }
            : upload
        ));

        return photo;
      } catch (error) {
        setUploads(prev => prev.map((upload, i) => 
          i === uploads.length + index
            ? { 
                ...upload, 
                status: 'error' as const, 
                error: error instanceof Error ? error.message : 'Upload failed' 
              }
            : upload
        ));
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulPhotos = results.filter((photo: Photo | null): photo is Photo => photo !== null);
      
      if (successfulPhotos.length > 0) {
        onPhotosUploaded(successfulPhotos);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  }, [uploads.length, maxFiles, userId, productId, onPhotosUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: maxFiles - uploads.length,
    disabled: uploads.length >= maxFiles
  });

  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  };

  const retryUpload = async (index: number) => {
    const upload = uploads[index];
    if (!upload || upload.status !== 'error') return;

    setUploads(prev => prev.map((u, i) => 
      i === index ? { ...u, status: 'uploading', progress: 0, error: undefined } : u
    ));

    try {
      const progressInterval = setInterval(() => {
        setUploads(prev => prev.map((u, i) => 
          i === index && u.status === 'uploading'
            ? { ...u, progress: Math.min(u.progress + 10, 90) }
            : u
        ));
      }, 200);

      const photo = await uploadPhoto(upload.file, userId, productId);
      
      clearInterval(progressInterval);
      
      setUploads(prev => prev.map((u, i) => 
        i === index ? { ...u, progress: 100, status: 'success', photo } : u
      ));

      onPhotosUploaded([photo]);
    } catch (error) {
      setUploads(prev => prev.map((u, i) => 
        i === index 
          ? { 
              ...u, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed' 
            }
          : u
      ));
    }
  };

  const hasSuccessfulUploads = uploads.some(upload => upload.status === 'success');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {uploads.length < maxFiles && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop images here' : 'Upload Photos'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop images here, or click to select files
              </p>
              <p className="text-xs text-gray-400">
                Maximum {maxFiles} files, 10MB each. JPG, PNG, GIF, WebP supported.
              </p>
              <Button variant="outline" className="mt-4">
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Global Error */}
      {globalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">
            Uploads ({uploads.filter(u => u.status === 'success').length}/{uploads.length})
          </h3>
          
          {uploads.map((upload, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* File Preview */}
                  <div className="flex-shrink-0">
                    {upload.photo ? (
                      <img 
                        src={upload.photo.url} 
                        alt={upload.file.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{upload.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(upload.file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                    
                    {/* Progress Bar */}
                    {upload.status === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={upload.progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{upload.progress}%</p>
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {upload.status === 'error' && upload.error && (
                      <p className="text-sm text-red-500 mt-1">{upload.error}</p>
                    )}
                  </div>

                  {/* Status Icon and Actions */}
                  <div className="flex items-center space-x-2">
                    {upload.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    
                    {upload.status === 'error' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryUpload(index)}
                        >
                          Retry
                        </Button>
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeUpload(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Success Message */}
      {hasSuccessfulUploads && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {uploads.filter(u => u.status === 'success').length} photo(s) uploaded successfully!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}