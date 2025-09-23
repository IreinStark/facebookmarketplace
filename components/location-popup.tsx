"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Loader2, X } from "lucide-react"

interface LocationData {
	name: string
	lat: number
	lng: number
	region: string
}

interface LocationPopupProps {
	isOpen: boolean
	onClose: () => void
	onLocationSelect: (location: string) => void
	locationData: LocationData[]
}

export function LocationPopup({ isOpen, onClose, onLocationSelect, locationData }: LocationPopupProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
	const [closestLocation, setClosestLocation] = useState<LocationData | null>(null)

	// Function to calculate distance between two coordinates using Haversine formula
	const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
		const R = 6371 // Earth's radius in kilometers
		const dLat = (lat2 - lat1) * Math.PI / 180
		const dLng = (lng2 - lng1) * Math.PI / 180
		const a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
			Math.sin(dLng/2) * Math.sin(dLng/2)
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
		return R * c
	}

	// Function to find the closest location
	const findClosestLocation = (userLat: number, userLng: number): LocationData | null => {
		let closest: LocationData | null = null
		let minDistance = Infinity

		locationData.forEach(location => {
			const distance = calculateDistance(userLat, userLng, location.lat, location.lng)
			if (distance < minDistance) {
				minDistance = distance
				closest = location
			}
		})

		return closest
	}

	// Function to get user's current location
	const getUserLocation = () => {
		if (!navigator.geolocation) {
			setError("Geolocation is not supported by this browser.")
			return
		}

		setIsLoading(true)
		setError(null)

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords
				setUserLocation({ lat: latitude, lng: longitude })
				
				const closest = findClosestLocation(latitude, longitude)
				setClosestLocation(closest)
				setIsLoading(false)
			},
			(error) => {
				let errorMessage = "Unable to retrieve your location."
				switch (error.code) {
					case error.PERMISSION_DENIED:
						errorMessage = "Location access denied. Please enable location permissions."
						break
					case error.POSITION_UNAVAILABLE:
						errorMessage = "Location information is unavailable."
						break
					case error.TIMEOUT:
						errorMessage = "Location request timed out."
						break
				}
				setError(errorMessage)
				setIsLoading(false)
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 300000 // 5 minutes
			}
		)
	}

	// Function to handle location selection
	const handleLocationSelect = (location: LocationData) => {
		onLocationSelect(location.name)
		onClose()
	}

	// Function to handle manual location selection
	const handleManualSelection = () => {
		onClose()
	}

	// Reset state when dialog opens
	useEffect(() => {
		if (isOpen) {
			setError(null)
			setUserLocation(null)
			setClosestLocation(null)
		}
	}, [isOpen])

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<MapPin className="h-5 w-5 text-blue-600" />
						Set Your Location
					</DialogTitle>
					<DialogDescription>
						We'll help you find products near you by detecting your location or you can select manually.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{!userLocation && !isLoading && !error && (
						<div className="text-center py-4">
							<Button
								onClick={getUserLocation}
								className="w-full bg-blue-600 hover:bg-blue-700"
							>
								<MapPin className="h-4 w-4 mr-2" />
								Detect My Location
							</Button>
						</div>
					)}

					{isLoading && (
						<div className="text-center py-4">
							<Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
							<p className="text-sm text-gray-600">Detecting your location...</p>
						</div>
					)}

					{error && (
						<div className="text-center py-4">
							<div className="bg-red-50 border border-red-200 rounded-lg p-4">
								<p className="text-sm text-red-600 mb-3">{error}</p>
								<Button
									variant="outline"
									size="sm"
									onClick={getUserLocation}
									className="mr-2"
								>
									Try Again
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={handleManualSelection}
								>
									Select Manually
								</Button>
							</div>
						</div>
					)}

					{closestLocation && userLocation && (
						<div className="space-y-3">
							<div className="bg-green-50 border border-green-200 rounded-lg p-4">
								<div className="flex items-center gap-2 mb-2">
									<MapPin className="h-4 w-4 text-green-600" />
									<span className="font-medium text-green-800">Location Detected!</span>
								</div>
								<p className="text-sm text-green-700 mb-3">
									We found you near <strong>{closestLocation.name}</strong> in the {closestLocation.region} region.
								</p>
								<Button
									onClick={() => handleLocationSelect(closestLocation!)}
									className="w-full bg-green-600 hover:bg-green-700"
								>
									Use {closestLocation.name}
								</Button>
							</div>
						</div>
					)}

					{!isLoading && !error && (
						<div className="space-y-2">
							<div className="text-sm font-medium text-gray-700 mb-2">Or select manually:</div>
							<div className="max-h-48 overflow-y-auto space-y-1">
								{locationData.map((location) => (
									<Button
										key={location.name}
										variant="outline"
										size="sm"
										onClick={() => handleLocationSelect(location)}
										className="w-full justify-start text-left h-auto py-2 px-3"
									>
										<div>
											<div className="font-medium">{location.name}</div>
											<div className="text-xs text-gray-500">{location.region}</div>
										</div>
									</Button>
								))}
							</div>
						</div>
					)}
				</div>

				<div className="flex justify-end gap-2 pt-4 border-t">
					<Button
						variant="outline"
						onClick={onClose}
					>
						<X className="h-4 w-4 mr-2" />
						Cancel
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
