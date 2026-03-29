import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ParkingSlotFormData, type ParkingArea, ParkingSlotSchema } from '../types';
import { axiosInstance } from "@/services/apiClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { fetcher } from "@/utils/swrFetcher";
import useSWRMutation from "swr/mutation";
import { Card, CardContent } from "@/components/ui/card";
import { extractErrorMessage } from "@/utils/errorHandler";
import {Form, FormField, FormItem, FormLabel, FormControl, FormMessage,} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AxiosError } from "axios";
import { Checkbox } from "@/components/ui/checkbox";

interface ParkingSlotFormProps {
  initialValues?: ParkingSlotFormData;
  onSuccess?: () => void;
  isEditing?: boolean;
  parkingslotId?: number
}

async function createParkingSlot(
  _: string,
  { arg }: { arg: ParkingSlotFormData }
) {
  const payload = ParkingSlotSchema.parse(arg);
  await axiosInstance.post("/slots/parkingslots/", payload);
}

export default function ParkingSlotForm({ onSuccess, initialValues, isEditing = false, parkingslotId }: ParkingSlotFormProps) {

  const form = useForm<ParkingSlotFormData>({
    resolver: zodResolver(ParkingSlotSchema),
    defaultValues: initialValues ?? {
      name: "",
      description: "",
      area: undefined,
      available: true
    },
  });

  const { trigger, isMutating } = useSWRMutation("/slots/parkingslots/", createParkingSlot);

  const { data: ParkingAreas } = useSWR<ParkingArea[]>("/slots/parkingareas/", fetcher);

  const onSubmit = async (values: ParkingSlotFormData) => {
  try {
    if (isEditing && parkingslotId) {
      // Editing
      await axiosInstance.patch(`/slots/parkingslots/${parkingslotId}/`, values);
      if (onSuccess) {
        onSuccess();
      }
    } else {
      // Creating
      await trigger(values);
      if (onSuccess) {
        onSuccess();
      }
      form.reset();
    }
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error
    ) {
      const responseData = (error as AxiosError).response?.data;

      if (responseData && typeof responseData === "object") {
        Object.entries(responseData).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            form.setError(field as any, {
              message: messages[0] as string,
            });
          }
        });
        return;
      }
    }

    form.setError("root", {
      message: extractErrorMessage(error),
    });
  }
};

  return (
    <Card className="max-w-xl">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">
            {initialValues ? "Edit Category" : "New Category"}
          </h1>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                      <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Parking Area */}
            <FormField control={form.control} name="area" render={({ field }) => (
              <FormItem>
                <FormLabel>Parking Area</FormLabel>
                <Select
                onValueChange={(val) => field.onChange(Number(val))}
                value={field.value?.toString() || ""}
                >
                <SelectTrigger>
                    <SelectValue placeholder="Select parking area" />
                </SelectTrigger>
                <SelectContent>
                    {ParkingAreas?.map(pa => (
                    <SelectItem key={pa.id} value={pa.id.toString()}>{pa.name}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Slot Availability */}
              <FormField control={form.control} name="available" render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Slot Available For Use</FormLabel>
                  </FormItem>
                )}
              />


            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <Button type="submit" disabled={isMutating}>
              {isMutating ? isEditing ? "Saving…" : "Creating…" : isEditing ? "Save" : "Create Parking Slot"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
