"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Switch } from "@components/ui/switch";
import { Badge } from "@components/ui/badge";
import { ArrowLeft, Upload, X, MapPin, DollarSign, Tag, FileText, Camera, ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { PhotoUpload } from "../../components/photo-upload";
import { type Photo } from "../../lib/firebase-utils";

const categories = ["Electronics", "Furniture", "Sports", "Clothing", "Books", "Home & Garden", "Automotive", "Other"];
const conditions = ["New", "Like New", "Good", "Fair", "Poor"];

export default function SellPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    location: "",
    isNegotiable: false,
  });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

 const handlePhotosUploaded = (newPhotos: Photo[]) => {
  setPhotos((prev) => [...prev, ...newPhotos]);
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please log in");
        return;
      }

      await addDoc(collection(db, "products"), {
        title: formData.title,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        location: formData.location,
        isNegotiable: formData.isNegotiable,
        image: photos[0]?.url || "/placeholder.svg",
        photos: photos.map((photo: Photo) => ({
          id: photo.id,
          url: photo.url,
          filename: photo.filename
        })),
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      // Simulate API call
      setTimeout(() => {
        // In a real app, you would send this data to your backend
        console.log("Product data:", { ...formData, photos });

        // Show success message and redirect
        alert("Product listed successfully!");
        setIsLoading(false);
        router.push("/");
      }, 2000);
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Failed to post item.");
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.title &&
    formData.description &&
    formData.price &&
    formData.category &&
    formData.condition &&
    formData.location;

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
          <h1 className="ml-2 sm:ml-4 text-lg sm:text-xl font-semibold">Sell Your Item</h1>
        </div>
      </header>

      <div className="container py-4 sm:py-6 px-2 sm:px-4 max-w-4xl">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Tag className="h-5 w-5 mr-2" />
              Create New Listing
            </CardTitle>
            <p className="text-muted-foreground text-sm sm:text-base">Fill in the details to list your item for sale</p>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Camera className="h-4 w-4" />
                  <Label className="text-sm sm:text-base">Photos</Label>
                  <Badge variant="secondary" className="text-xs">
                    Up to 10 photos
                  </Badge>
                  {photos.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {photos.length}/10
                    </Badge>
                  )}
                </div>

                <PhotoUpload
                  onPhotosUploaded={handlePhotosUploaded}
                  userId={auth.currentUser?.uid || ''}
                  maxFiles={10}
                  className="w-full"
                />

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="h-4 w-4" />
                    <span>Tips for great photos:</span>
                  </div>
                  <ul className="ml-6 space-y-1">
                    <li>• Use natural lighting when possible</li>
                    <li>• Take photos from multiple angles</li>
                    <li>• Show any defects or wear clearly</li>
                    <li>• First photo will be used as the cover image</li>
                  </ul>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <Label htmlFor="title" className="text-sm sm:text-base">
                    Title *
                  </Label>
                </div>
                <Input
                  id="title"
                  placeholder="What are you selling?"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                  maxLength={100}
                  className="text-sm sm:text-base"
                />
                <p className="text-xs text-muted-foreground">{formData.title.length}/100 characters</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm sm:text-base">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item in detail..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                  rows={4}
                  maxLength={500}
                  className="text-sm sm:text-base resize-none"
                />
                <p className="text-xs text-muted-foreground">{formData.description.length}/500 characters</p>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <Label htmlFor="price" className="text-sm sm:text-base">
                    Price *
                  </Label>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="pl-8 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Negotiable Toggle */}
              <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                <div>
                  <Label htmlFor="negotiable" className="text-sm sm:text-base">
                    Price is negotiable
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Allow buyers to make offers</p>
                </div>
                <Switch
                  id="negotiable"
                  checked={formData.isNegotiable}
                  onCheckedChange={(checked) => handleInputChange("isNegotiable", checked)}
                />
              </div>

              {/* Category and Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Condition *</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          {condition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <Label htmlFor="location" className="text-sm sm:text-base">
                    Location *
                  </Label>
                </div>
                <Input
                  id="location"
                  placeholder="Where is this item located?"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  required
                  className="text-sm sm:text-base"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6">
                <Link href="/" className="flex-1">
                  <Button type="button" variant="outline" className="w-full h-10 sm:h-11 bg-transparent">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="flex-1 h-10 sm:h-11" disabled={!isFormValid || isLoading}>
                  {isLoading ? "Publishing..." : "Publish Listing"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="mt-4 sm:mt-6">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Tips for a Great Listing</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-2 text-xs sm:text-sm text-muted-foreground">
            <p>• Use clear, well-lit photos from multiple angles</p>
            <p>• Write a detailed description including size, brand, and condition</p>
            <p>• Research similar items to price competitively</p>
            <p>• Be honest about any flaws or wear</p>
            <p>• Respond quickly to interested buyers</p>
            <p>• Add multiple photos to show different aspects of your item</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
