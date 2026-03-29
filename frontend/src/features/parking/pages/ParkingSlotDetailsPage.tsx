import useSWR from "swr";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {Pencil, Trash2, X,} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/services/apiClient";
import { fetcher } from "@/utils/swrFetcher";
import { extractErrorMessage } from "@/utils/errorHandler";
import { toast } from "sonner";
import { type ParkingSlot, } from "../types";
import ParkingSlotForm from "../components/ParkingSlotForm";
import ParkingSlotActions from "../components/ParkingSlotActions";


export default function ParkingSlotDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const { data, error, isLoading, mutate,} = useSWR<ParkingSlot>(id ? `/slots/parkingslots/${id}/` : null, fetcher);
  console.log("Fetched parking slot:", data);

  const onEditSuccess = async () => {
    toast.success("Parking Slot updated");
    setIsEditing(false);
    await mutate();
  };

  const onDelete = async () => {
    if (!confirm("Delete this parking slot?")) return;

    try {
      await axiosInstance.delete(`/slots/parkingslots/${id}/`);
      toast.success("Parking Slot deleted");
      navigate("/parkingslots");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading parking slot…
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {extractErrorMessage(error)}
      </p>
    );
  }

  if (!data) return null;

  return (
    <Card className="max-w-xl">
      <CardContent className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
              <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/parkingslots")}
              className="mr-2"
            >
              ← Back
            </Button>
            <h1 className="text-lg font-semibold">
              Parking Slot Details
            </h1>
          </div>

          {!isEditing && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* View mode */}
        {!isEditing && (
          <div className="space-y-3 text-sm">
            <p className="font-medium">{data.name}</p>

            {data.description && (
              <p className="flex items-center gap-2 text-muted-foreground">
                {data.description}
              </p>
            )}

            {data.available && (
              <p className="flex items-center gap-2 text-muted-foreground">
                {data.available}
              </p>
            )}

            {data.area && (
              <p className="flex items-center gap-2 text-muted-foreground">
                {data.area}
              </p>
            )}

            {data.created_by && (
              <p className="flex items-center gap-2 text-muted-foreground">
                {data.created_by} at {data.created_at}
              </p>
            )}

            {data.modified_by && (
              <p className="flex items-center gap-2 text-muted-foreground">
                Last modified by {data.modified_by} at {data.modified_at}
              </p>
            )}
          </div>
        )}

        {!isEditing && (
          <ParkingSlotActions
            slot={{ ...data, current_session: data.current_session }}
            onUpdate={mutate}
          />
        )}

        {/* Edit mode */}
        {isEditing && (
          <div className="p-4 border rounded-md bg-muted/30">
            <ParkingSlotForm
              initialValues={{
                name: data.name,
                description: data.description,
                available: data.available,
                area: data.area
              }}
              isEditing
              parkingslotId={data.id}
              onSuccess={onEditSuccess}
            />

            <div className="mt-2 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
