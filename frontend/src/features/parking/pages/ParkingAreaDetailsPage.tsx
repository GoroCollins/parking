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
import { type ParkingArea, } from "../types";
import ParkingAreaForm from "../components/ParkingAreaForm";


export default function ParkingAreaDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const { data, error, isLoading, mutate,} = useSWR<ParkingArea>(id ? `/slots/parkingareas/${id}/` : null, fetcher);

  const onEditSuccess = async () => {
    toast.success("Parking Area updated");
    setIsEditing(false);
    await mutate();
  };

  const onDelete = async () => {
    if (!confirm("Delete this parking area?")) return;

    try {
      await axiosInstance.delete(`/slots/parkingareas/${id}/`);
      toast.success("Parking Area deleted");
      navigate("/parkingareas");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading parking area…
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
              onClick={() => navigate("/parkingareas")}
              className="mr-2"
            >
              ← Back
            </Button>
            <h1 className="text-lg font-semibold">
              Parking Area Details
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

            {data.rate_per_hour && (
              <p className="flex items-center gap-2 text-muted-foreground">
                {data.rate_per_hour}
              </p>
            )}

            {data.created_by && (
              <p className="flex items-center gap-2 text-muted-foreground">
                Created by {data.created_by} at {data.created_at}
              </p>
            )}

            {data.modified_by && (
              <p className="flex items-center gap-2 text-muted-foreground">
                Last modified by {data.modified_by} at {data.modified_at}
              </p>
            )}
          </div>
        )}

        {/* Edit mode */}
        {isEditing && (
          <div className="p-4 border rounded-md bg-muted/30">
            <ParkingAreaForm
              initialValues={{
                name: data.name,
                description: data.description,
                rate_per_hour: data.rate_per_hour
              }}
              isEditing
              parkingareaId={data.id}
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
