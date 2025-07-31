"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Label } from "@components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Switch } from "@components/ui/switch";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    condition: "",
    location: "",
    isNegotiable: false,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            title: data.title || "",
            price: data.price?.toString() || "",
            description: data.description || "",
            category: data.category || "",
            condition: data.condition || "",
            location: data.location || "",
            isNegotiable: !!data.isNegotiable,
          });
        } else {
          setError("Product not found.");
        }
      } catch (err) {
        setError("Failed to fetch product.");
      } finally {
        setLoading(false);
      }
    }
    if (productId) fetchProduct();
  }, [productId]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const docRef = doc(db, "products", productId);
      await updateDoc(docRef, {
        ...form,
        price: parseFloat(form.price),
      });
      router.push(`/products/${productId}`);
    } catch (err) {
      setError("Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Edit Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={e => handleChange("title", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" value={form.price} onChange={e => handleChange("price", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={form.description} onChange={e => handleChange("description", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={form.category} onChange={e => handleChange("category", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Input id="condition" value={form.condition} onChange={e => handleChange("condition", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={form.location} onChange={e => handleChange("location", e.target.value)} required />
            </div>
            <div className="flex items-center justify-between p-2 border rounded-lg">
              <Label htmlFor="negotiable">Price is negotiable</Label>
              <Switch id="negotiable" checked={form.isNegotiable} onCheckedChange={checked => handleChange("isNegotiable", checked)} />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}