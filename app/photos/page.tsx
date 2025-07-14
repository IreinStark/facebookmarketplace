"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { ArrowLeft, Camera, MapPin, Upload } from "lucide-react";
import Link from "next/link";
import { PhotoUpload } from "../../components/photo-upload";
import { PhotoGallery } from "../../components/photo-gallery";
import { type Photo } from "../../lib/firebase-utils";
import { auth } from "@/firebase";

// Mock photos for demonstration
const mockPhotos: Photo[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    filename: "mountain-landscape.jpg",
    uploadedBy: "user1",
    uploadedAt: new Date() as any,
    location: {
      latitude: 35.1856,
      longitude: 33.3823,
      address: "Lefkosa, Northern Cyprus",
      radius: 5
    }
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    filename: "forest-path.jpg",
    uploadedBy: "user2",
    uploadedAt: new Date() as any,
    location: {
      latitude: 35.3414,
      longitude: 33.3152,
      address: "Girne, Northern Cyprus",
      radius: 3
    }
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    filename: "beach-sunset.jpg",
    uploadedBy: "user3",
    uploadedAt: new Date() as any,
    location: {
      latitude: 35.1264,
      longitude: 33.9378,
      address: "Famagusta, Northern Cyprus",
      radius: 8
    }
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    filename: "city-street.jpg",
    uploadedBy: "user4",
    uploadedAt: new Date() as any,
    location: {
      latitude: 35.2833,
      longitude: 33.9167,
      address: "Iskele, Northern Cyprus",
      radius: 2
    }
  }
];

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>(mockPhotos);
  const [showUpload, setShowUpload] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser: any) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  const handlePhotosUploaded = (newPhotos: Photo[]) => {
    setPhotos((prev: Photo[]) => [...prev, ...newPhotos]);
    setShowUpload(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 sm:h-16 items-center px-2 sm:px-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="ml-2 sm:ml-4 text-lg sm:text-xl font-semibold">Photo Gallery</h1>
          
          <div className="ml-auto flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              Location Enabled
            </Badge>
            {user && (
              <Button
                onClick={() => setShowUpload(!showUpload)}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Photos</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container py-4 sm:py-6 px-2 sm:px-4 max-w-7xl">
        {/* Upload Section */}
        {showUpload && user && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Camera className="h-5 w-5 mr-2" />
                Upload Photos with Location
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Upload photos and automatically capture your location with customizable radius
              </p>
            </CardHeader>
            <CardContent>
              <PhotoUpload
                onPhotosUploaded={handlePhotosUploaded}
                userId={user.uid}
                maxFiles={10}
                enableLocation={true}
                className="w-full"
              />
            </CardContent>
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Location Capture</p>
                  <p className="text-xs text-muted-foreground">Automatically capture GPS coordinates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Radius Control</p>
                  <p className="text-xs text-muted-foreground">Set custom radius for each photo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium text-sm">Smart Filtering</p>
                  <p className="text-xs text-muted-foreground">Filter by location and radius</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Photo Gallery */}
        <PhotoGallery
          photos={photos}
          showMap={true}
          enableFiltering={true}
          className="w-full"
        />

        {/* Demo Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">📸 Upload with Location</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Enable location access when uploading</li>
                  <li>• Photos automatically capture GPS coordinates</li>
                  <li>• Set custom radius for each photo</li>
                  <li>• Address is automatically resolved</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🗺️ View on Map</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Interactive map showing all photo locations</li>
                  <li>• Filter photos by distance from your location</li>
                  <li>• Search by location or filename</li>
                  <li>• Click photos to see detailed location info</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}