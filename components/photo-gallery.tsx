"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { formatTimestamp } from '@/lib/timestamp-utils';
import { 
  MapPin, 
  Navigation, 
  Globe, 
  Filter, 
  X, 
  ZoomIn, 
  ZoomOut,
  Layers,
  Search
} from 'lucide-react';
import { type Photo } from '../lib/firebase-utils';

interface PhotoGalleryProps {
  photos: Photo[];
  className?: string;
  showMap?: boolean;
  enableFiltering?: boolean;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function PhotoGallery({ 
  photos, 
  className = "",
  showMap = true,
  enableFiltering = true
}: PhotoGalleryProps) {
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>(photos);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [mapZoom, setMapZoom] = useState(12);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [radiusFilter, setRadiusFilter] = useState(50); // km
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Update filtered photos when photos prop changes
  useEffect(() => {
    setFilteredPhotos(photos);
  }, [photos]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter photos by radius and search term
  useEffect(() => {
    let filtered = photos;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(photo => 
        photo.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.filename.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by radius if user location is available
    if (userLocation && radiusFilter < 50) {
      filtered = filtered.filter(photo => {
        if (!photo.location) return false;
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          photo.location.latitude,
          photo.location.longitude
        );
        return distance <= radiusFilter;
      });
    }

    setFilteredPhotos(filtered);
  }, [photos, searchTerm, radiusFilter, userLocation]);

  // Calculate map bounds
  const getMapBounds = (): MapBounds => {
    if (filteredPhotos.length === 0) {
      return {
        north: 35.5,
        south: 35.0,
        east: 33.5,
        west: 33.0
      };
    }

    const lats = filteredPhotos.map((p: Photo) => p.location?.latitude).filter(Boolean) as number[];
    const lngs = filteredPhotos.map((p: Photo) => p.location?.longitude).filter(Boolean) as number[];

    if (lats.length === 0) {
      return {
        north: 35.5,
        south: 35.0,
        east: 33.5,
        west: 33.0
      };
    }

    return {
      north: Math.max(...lats) + 0.01,
      south: Math.min(...lats) - 0.01,
      east: Math.max(...lngs) + 0.01,
      west: Math.min(...lngs) - 0.01
    };
  };

  const bounds = getMapBounds();

  // Generate OpenStreetMap URL
  const getMapUrl = (): string => {
    const centerLat = (bounds.north + bounds.south) / 2;
    const centerLng = (bounds.east + bounds.west) / 2;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bounds.west},${bounds.south},${bounds.east},${bounds.north}&layer=mapnik&marker=${centerLat},${centerLng}`;
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRadiusFilter(50);
    setShowFilters(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Photo Gallery</h3>
          <Badge variant="secondary">{filteredPhotos.length} photos</Badge>
        </div>
        
        {enableFiltering && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && enableFiltering && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Filters</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <Label className="text-xs">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by location or filename..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Radius Filter */}
              {userLocation && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Radius: {radiusFilter}km</Label>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Navigation className="h-3 w-3" />
                      <span>From your location</span>
                    </div>
                  </div>
                  <Slider
                    value={[radiusFilter]}
                    onValueChange={(value) => setRadiusFilter(value[0])}
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
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map View */}
      {showMap && filteredPhotos.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="relative">
              <div className="absolute top-2 right-2 z-10 flex space-x-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setMapZoom(Math.min(mapZoom + 1, 18))}
                  className="h-8 w-8 p-0"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setMapZoom(Math.max(mapZoom - 1, 8))}
                  className="h-8 w-8 p-0"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
              
              <iframe
                src={getMapUrl()}
                width="100%"
                height="400"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                title="Photo Locations Map"
                className="rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo) => (
          <Card 
            key={photo.id} 
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handlePhotoClick(photo)}
          >
            <div className="relative">
              <img
                src={photo.url}
                alt={photo.filename}
                className="w-full h-48 object-cover"
              />
              
              {photo.location && (
                <div className="absolute top-2 left-2">
                  <Badge className="text-xs bg-secondary text-secondary-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    {photo.location.radius}km
                  </Badge>
                </div>
              )}
            </div>
            
            <CardContent className="p-3">
              <div className="space-y-2">
                <p className="text-sm font-medium truncate">{photo.filename}</p>
                
                {photo.location && (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{photo.location.address}</span>
                    </div>
                    
                    {userLocation && (
                      <div className="text-xs text-muted-foreground">
                        {calculateDistance(
                          userLocation.latitude,
                          userLocation.longitude,
                          photo.location.latitude,
                          photo.location.longitude
                        ).toFixed(1)}km away
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  {formatTimestamp(photo.uploadedAt)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredPhotos.length === 0 && (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No photos found</h3>
          <p className="text-muted-foreground mb-4">
            {photos.length === 0 
              ? "No photos have been uploaded yet."
              : "Try adjusting your filters to see more results."
            }
          </p>
          {photos.length > 0 && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedPhoto.filename}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.filename}
                className="w-full max-h-96 object-contain rounded-lg"
              />
              
              {selectedPhoto.location && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Location</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedPhoto.location.address}</p>
                  <p className="text-sm text-muted-foreground">
                    Radius: {selectedPhoto.location.radius}km
                  </p>
                  {userLocation && (
                    <p className="text-sm text-muted-foreground">
                      Distance: {calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        selectedPhoto.location.latitude,
                        selectedPhoto.location.longitude
                      ).toFixed(1)}km from your location
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}