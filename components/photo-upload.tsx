"use client"

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle, Camera, MapPin, Navigation, Globe } from 'lucide-react';
import { Timestamp, serverTimestamp } from "firebase/firestore";
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../app/firebase';

interface PhotoUploadProps {
  onPhotosUploaded: (photos: any[]) => void;
  userId: string;
  productId?: string;
  maxFiles?: number;
  className?: string;
  enableLocation?: boolean;
}

interface UploadState {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  photo?: any;
  error?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    radius: number;
  };
}

import { getCloudinaryUploadUrl, getCloudinaryConfig } from '../lib/cloudinary-config';

// Cloudinary upload function
async function uploadToCloudinary(file: File): Promise<string> {
  const { cloudName, uploadPreset } = getCloudinaryConfig();
  
  // Use Cloudinary for uploads
  const url = getCloudinaryUploadUrl();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error(`Cloudinary upload failed with status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Cloudinary upload successful:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new Error('Failed to upload image to Cloudinary.');
  }
}

export function PhotoUpload({ 
  onPhotosUploaded, 
  userId, 
  productId, 
  maxFiles = 5,
  className = "",
  enableLocation = true
}: PhotoUploadProps) {
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [globalError, setGlobalError] = useState<string>("");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [defaultRadius, setDefaultRadius] = useState(5); // Default 5km radius

  // Get current location on component mount
  useEffect(() => {
    if (enableLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setLocationEnabled(true);
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
          setLocationEnabled(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
  }, [enableLocation]);

  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || 'Unknown location';
    } catch (error) {
      console.error('Error getting address:', error);
      return 'Unknown location';
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setGlobalError("");
    
    // Check if user is authenticated
    const { auth } = await import('../app/firebase');
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      setGlobalError('You must be logged in to upload photos. Please sign in and try again.');
      return;
    }
    
    console.log('Current user for upload:', currentUser.uid, currentUser.email);
    
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

    // Get location data if enabled
    let locationData = null;
    if (enableLocation && locationEnabled && currentLocation) {
      const address = await getAddressFromCoords(currentLocation.latitude, currentLocation.longitude);
      locationData = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address,
        radius: defaultRadius
      };
    }

    // Initialize upload states
    const newUploads: UploadState[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
      location: locationData || undefined
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Upload files
    const uploadPromises = validFiles.map(async (file, index) => {
      const uploadIndex = uploads.length + index;
      const currentUpload = newUploads[index];
      let progressInterval: NodeJS.Timeout | null = null;
      
      try {
        // Set initial progress
        setUploads(prev => prev.map((upload, i: number) => 
          i === uploadIndex && upload.status === 'uploading'
            ? { ...upload, progress: 10 }
            : upload
        ));
        
        // --- Cloudinary upload ---
        console.log('Starting upload for:', file.name);
        
        // Update progress to 50% during upload
        setUploads(prev => prev.map((upload, i: number) => 
          i === uploadIndex && upload.status === 'uploading'
            ? { ...upload, progress: 50 }
            : upload
        ));
        
        const imageUrl = await uploadToCloudinary(file);
        console.log('Upload completed for:', file.name, 'URL:', imageUrl);
        
        // Update progress to 80% after upload
        setUploads(prev => prev.map((upload, i: number) => 
          i === uploadIndex
            ? { ...upload, progress: 80 }
            : upload
        ));
        
        // --- Store URL in Firestore ---
        const photoData = {
          url: imageUrl,
          filename: file.name,
          uploadedBy: currentUser.uid, // Use authenticated user's UID instead of userId prop
          uploadedAt: serverTimestamp(), // Use serverTimestamp() instead of new Date()
          metadata: {
            size: file.size,
            type: file.type
          },
          ...(productId ? { productId } : {}),
          ...(currentUpload.location ? { location: currentUpload.location } : {})
        };
        
        // If productId is provided, also update the product's images array
        if (productId) {
          try {
            const productRef = doc(db, 'products', productId); // Fixed: Missing productRef declaration
            const productSnap = await getDoc(productRef);
            
            if (productSnap.exists()) {
              // Get existing images array or create new one
              const productData = productSnap.data();
              let images = productData.images || [];
              if (!Array.isArray(images)) {
                images = productData.image ? [productData.image] : [];
              }
              
              // Add the new image URL
              images.push(imageUrl);
              
              // Update the product with the new images array
              await updateDoc(productRef, { 
                images: images,
                image: images[0] // Keep the first image as the main image
              });
              
              console.log('Updated product with new image URL:', imageUrl);
            }
          } catch (error) {
            console.error('Error updating product with image URL:', error);
            // Continue even if this fails - the photo document will still be created
          }
        }
        
        console.log('Saving to Firestore:', photoData);
        const docRef = await addDoc(collection(db, 'photos'), photoData);
        const photo = { id: docRef.id, ...photoData };
        console.log('Saved to Firestore with ID:', docRef.id);
        
        // Update to 100% and success
        setUploads(prev => prev.map((upload, i) => 
          i === uploadIndex
            ? { ...upload, progress: 100, status: 'success' as const, photo }
            : upload
        ));
        
        return photo;
      } catch (error) {
        // Clear progress interval on error
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        
        console.error('Upload error for file:', file.name, error);
        
        setUploads(prev => prev.map((upload, i) => 
          i === uploadIndex
            ? { 
                ...upload, 
                status: 'error' as const, 
                progress: 0,
                error: error instanceof Error ? error.message : 'Upload failed' 
              }
            : upload
        ));
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulPhotos = results.filter((photo: any): photo is any => photo !== null);
      
      if (successfulPhotos.length > 0) {
        onPhotosUploaded(successfulPhotos);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  }, [uploads.length, maxFiles, userId, productId, onPhotosUploaded, enableLocation, locationEnabled, currentLocation, defaultRadius]);

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
    
    let progressInterval: NodeJS.Timeout | null = null;
    
    try {
      // Set initial progress
      setUploads(prev => prev.map((u, i) => 
        i === index && u.status === 'uploading'
          ? { ...u, progress: 10 }
          : u
      ));
      
      // --- Cloudinary upload ---
      console.log('Retrying upload for:', upload.file.name);
      
      // Update progress to 50% during upload
      setUploads(prev => prev.map((u, i) => 
        i === index && u.status === 'uploading'
          ? { ...u, progress: 50 }
          : u
      ));
      
      const imageUrl = await uploadToCloudinary(upload.file);
      console.log('Retry upload completed for:', upload.file.name, 'URL:', imageUrl);
      
      // Update progress to 80% after upload
      setUploads(prev => prev.map((u, i) => 
        i === index ? { ...u, progress: 80 } : u
      ));
      
      // --- Store URL in Firestore ---
      // Re-check authentication for retry
      const { auth } = await import('../app/firebase');
      const retryUser = auth.currentUser;
      
      if (!retryUser) {
        throw new Error('Authentication lost during retry. Please sign in again.');
      }
      
      const photoData = {
        url: imageUrl,
        filename: upload.file.name,
        uploadedBy: retryUser.uid, // Use authenticated user's UID instead of userId prop
        uploadedAt: serverTimestamp(), // Use serverTimestamp() instead of new Date()
        metadata: {
          size: upload.file.size,
          type: upload.file.type
        },
        ...(productId ? { productId } : {}),
        ...(upload.location ? { location: upload.location } : {})
      };
      
      console.log('Saving retry to Firestore:', photoData);
      const docRef = await addDoc(collection(db, 'photos'), photoData);
      const photo = { id: docRef.id, ...photoData };
      console.log('Retry saved to Firestore with ID:', docRef.id);
      
      // Update to 100% and success
      setUploads(prev => prev.map((u, i) => 
        i === index ? { ...u, progress: 100, status: 'success', photo } : u
      ));
      
      onPhotosUploaded([photo]);
    } catch (error) {
      // Clear progress interval on error
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      console.error('Retry upload error for file:', upload.file.name, error);
      
      setUploads(prev => prev.map((u, i) => 
        i === index 
          ? { 
              ...u, 
              status: 'error', 
              progress: 0,
              error: error instanceof Error ? error.message : 'Upload failed' 
            }
          : u
      ));
    }
  };

  const updateLocationRadius = (index: number, radius: number) => {
    setUploads(prev => prev.map((upload, i: number) => 
      i === index && upload.location
        ? { ...upload, location: { ...upload.location, radius } }
        : upload
    ));
  };

  const hasSuccessfulUploads = uploads.some(upload => upload.status === 'success');

  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      {/* Location Settings */}
      {enableLocation && (
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <Label className="text-sm font-medium">Location Settings</Label>
                </div>
                <Badge variant={locationEnabled ? "default" : "secondary"}>
                  {locationEnabled ? "Location Enabled" : "Location Disabled"}
                </Badge>
              </div>
              
              {locationEnabled && currentLocation ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Navigation className="h-3 w-3" />
                    <span>Current Location: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Default Radius: {defaultRadius}km</Label>
                    <Slider
                      value={[defaultRadius]}
                      onValueChange={(value) => setDefaultRadius(value[0])}
                      max={50}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1km</span>
                      <span>25km</span>
                      <span>50km</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Globe className="h-3 w-3" />
                  <span>Location access required for radius features</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
                
                <div>
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
                    {enableLocation && locationEnabled && (
                      <p className="text-xs text-blue-500">
                        📍 Location will be captured automatically
                      </p>
                    )}
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
                      {upload.photo?.url ? (
                        <img 
                          src={upload.photo.url} 
                          alt={upload.file.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-cover rounded border"
                          onError={(e) => {
                            console.error('Failed to load uploaded image:', upload.photo.url);
                            const imgElement = e.currentTarget as HTMLImageElement;
                            const fallbackElement = imgElement.nextElementSibling as HTMLElement;
                            imgElement.style.display = 'none';
                            if (fallbackElement) {
                              fallbackElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : upload.status === 'uploading' ? (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gray-100 dark:bg-gray-800 rounded border flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gray-100 dark:bg-gray-800 rounded border flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-gray-400" />
                        </div>
                      )}
                      {/* Fallback div for image error */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-red-100 dark:bg-red-900 rounded border items-center justify-center" style={{ display: 'none' }}>
                        <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-red-400" />
                      </div>
                    </div>

                    {/* File Info - Responsive text and spacing */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-medium text-xs sm:text-sm lg:text-base truncate">{upload.file.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {(upload.file.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                      
                      {/* Location Info */}
                      {upload.location && (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-xs text-blue-600">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{upload.location.address}</span>
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-xs">Radius: {upload.location.radius}km</Label>
                            <Slider
                              value={[upload.location.radius]}
                              onValueChange={(value) => updateLocationRadius(index, value[0])}
                              max={50}
                              min={1}
                              step={1}
                              className="w-full h-2"
                            />
                          </div>
                        </div>
                      )}
                      
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
            {enableLocation && locationEnabled && " Location data has been captured."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}