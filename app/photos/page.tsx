"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { ArrowLeft, Camera, MapPin, Upload, Search, Filter, Grid, List } from "lucide-react";
import Link from "next/link";
import { PhotoUpload } from "../../components/photo-upload";
import { PhotoGallery } from "../../components/photo-gallery";
import { type Photo } from "../../lib/firebase-utils";
import { auth } from "@/firebase";
import { Timestamp } from "firebase/firestore";

// Mock photos for demonstration
const mockPhotos: Photo[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    filename: "mountain-landscape.jpg",
    uploadedBy: "user1",
    uploadedAt: Timestamp.fromDate(new Date()),
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
    uploadedAt: Timestamp.fromDate(new Date()),
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
    uploadedAt: Timestamp.fromDate(new Date()),
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
    uploadedAt: Timestamp.fromDate(new Date()),
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
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>(mockPhotos);
  const [showUpload, setShowUpload] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser: any) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Filter photos based on search and location
  useEffect(() => {
    let filtered = photos;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(photo =>
        photo.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(photo =>
        photo.location?.address?.includes(selectedLocation)
      );
    }

    setFilteredPhotos(filtered);
  }, [photos, searchTerm, selectedLocation]);

  const handlePhotosUploaded = (newPhotos: Photo[]) => {
    setPhotos((prev: Photo[]) => [...prev, ...newPhotos]);
    setShowUpload(false);
  };

  const locations = Array.from(new Set(photos.map(p => p.location?.address?.split(',')[0]).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur">
        <div className="container flex h-14 sm:h-16 items-center px-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="ml-2 sm:ml-4 text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Photo Gallery
          </h1>
          
          <div className="ml-auto flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
              <MapPin className="h-3 w-3 mr-1" />
              Location Enabled
            </Badge>
            {user && (
              <Button
                onClick={() => setShowUpload(!showUpload)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Upload Photos</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container py-4 sm:py-6 px-4 max-w-7xl">
        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search photos by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none border-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none border-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''} found
            </span>
            {(searchTerm || selectedLocation !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLocation('all');
                }}
                className="text-xs"
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Upload Section */}
        {showUpload && user && (
          <Card className="mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-gray-900 dark:text-gray-100">
                <Camera className="h-5 w-5 mr-2" />
                Upload Photos with Location
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
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
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">Location Capture</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Automatically capture GPS coordinates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Camera className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">Radius Control</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Set custom radius for each photo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Filter className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">Smart Filtering</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Filter by location and search</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Photo Gallery */}
        {filteredPhotos.length > 0 ? (
          <PhotoGallery
            photos={filteredPhotos}
            showMap={true}
            enableFiltering={false} // We handle filtering above
            className="w-full"
            viewMode={viewMode}
          />
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm || selectedLocation !== 'all' ? 'No photos found' : 'No photos yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || selectedLocation !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first photo to get started!'
              }
            </p>
            {user && !showUpload && (
              <Button
                onClick={() => setShowUpload(true)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Photos
              </Button>
            )}
          </div>
        )}

        {/* Demo Info */}
        <Card className="mt-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100 flex items-center">
                  <span className="text-xl mr-2">📸</span>
                  Upload with Location
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Enable location access when uploading
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Photos automatically capture GPS coordinates
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Set custom radius for each photo
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Address is automatically resolved
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100 flex items-center">
                  <span className="text-xl mr-2">🗺️</span>
                  View and Organize
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Interactive map showing all photo locations
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Search by location or filename
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Filter photos by location
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Switch between grid and list views
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}