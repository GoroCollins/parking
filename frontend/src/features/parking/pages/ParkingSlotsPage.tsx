import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/utils/swrFetcher";
import { toast } from "sonner";
import ParkingSlotForm from "../components/ParkingSlotForm";
import ParkingSlotsList from "../components/ParkingSlotsList";
import type { ParkingSlot } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {  X } from "lucide-react";

export default function ParkingSlotsPage() {
  const [showForm, setShowForm] = useState(false);

  const { data: parkingSlots, error, isLoading, mutate } = useSWR<ParkingSlot[]>("/slots/parkingslots/", fetcher);

  const handleSuccess = () => {
    toast.success("Parking Slot created.");
    setShowForm(false);
    mutate(); // Refresh the list
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="shadow-md">
        {/* Header */}
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl font-semibold">Parking Slots</CardTitle>
          </div>

          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="gap-2">
               New Parking Slot
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
              <ParkingSlotForm onSuccess={handleSuccess} />
            </div>
          )}

          <Separator />

          {/* List */}
          <ParkingSlotsList parkingSlots={parkingSlots} isLoading={isLoading} error={error} />
        </CardContent>
      </Card>
    </div>
  );
}
