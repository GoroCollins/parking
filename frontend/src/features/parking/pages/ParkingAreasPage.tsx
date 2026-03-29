import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/utils/swrFetcher";
import { toast } from "sonner";
import ParkingAreaForm from "../components/ParkingAreaForm";
import ParkingAreasList from "../components/ParkingAreasList";
import type { ParkingArea } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {  X } from "lucide-react";

export default function ParkingAreasPage() {
  const [showForm, setShowForm] = useState(false);

  const { data: parkingAreas, error, isLoading, mutate } = useSWR<ParkingArea[]>("/slots/parkingareas/", fetcher);

  const handleSuccess = () => {
    toast.success("Parking Area created.");
    setShowForm(false);
    mutate(); // Refresh the list
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="shadow-md">
        {/* Header */}
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl font-semibold">Parking Areas</CardTitle>
          </div>

          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="gap-2">
               New Parking Area
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              className="gap-2"
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="space-y-6">
          {/* Form */}
          {showForm && (
            <div className="p-4 border rounded-md bg-muted/30">
              <ParkingAreaForm onSuccess={handleSuccess} />
            </div>
          )}

          <Separator />

          {/* List */}
          <ParkingAreasList parkingAreas={parkingAreas} isLoading={isLoading} error={error} />
        </CardContent>
      </Card>
    </div>
  );
}
