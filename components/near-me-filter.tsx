"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"
import { Switch } from "./ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { MapPin, Navigation, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"
import { getCurrentLocation, calculateDistance } from "../lib/user-utils"

interface NearMeFilterProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onLocationChange: (location: { latitude: number; longitude: number } | null) => void;
  onRadiusChange: (radius: number) => void;
  radius: number;
}

export function NearMeFilter({ 
  isEnabled, 
  onToggle, 
  onLocationChange, 
  onRadiusChange, 
  radius 
}: NearMeFilterProps) {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleLocationRequest = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      onLocationChange(location);
      onToggle(true);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Unable to get your location. Please enable location services.');
      onToggle(false);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleToggle = (enabled: boolean) => {
    if (enabled && !userLocation) {
      handleLocationRequest();
    } else {
      onToggle(enabled);
      if (!enabled) {
        onLocationChange(null);
      }
    }
  };

  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km}km`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Navigation className="h-5 w-5 text-primary" />
          Near Me
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="near-me-toggle" className="text-sm font-medium">
              Show items near my location
            </Label>
          </div>
          <Switch
            id="near-me-toggle"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isLoadingLocation}
          />
        </div>

        {locationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {locationError}
            </AlertDescription>
          </Alert>
        )}

        {isLoadingLocation && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Getting your location...
          </div>
        )}

        {isEnabled && userLocation && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Search Radius</Label>
              <span className="text-sm font-medium text-primary">
                {formatDistance(radius)}
              </span>
            </div>
            
            <Slider
              value={[radius]}
              onValueChange={(value) => onRadiusChange(value[0])}
              max={50}
              min={0.5}
              step={0.5}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>500m</span>
              <span>25km</span>
              <span>50km</span>
            </div>

            <div className="text-xs text-muted-foreground">
              📍 Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </div>
          </div>
        )}

        {isEnabled && !userLocation && !isLoadingLocation && !locationError && (
          <Button 
            onClick={handleLocationRequest}
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Get My Location
          </Button>
        )}
      </CardContent>
    </Card>
  );
}