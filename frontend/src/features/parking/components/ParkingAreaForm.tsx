import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ParkingAreaFormData, ParkingAreaSchema } from '../types';
import { axiosInstance } from "@/services/apiClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useSWRMutation from "swr/mutation";
import { Card, CardContent } from "@/components/ui/card";
import { extractErrorMessage } from "@/utils/errorHandler";
import {Form, FormField, FormItem, FormLabel, FormControl, FormMessage,} from "@/components/ui/form";
import { AxiosError } from "axios";

interface ParkingAreaFormProps {
  initialValues?: ParkingAreaFormData;
  onSuccess?: () => void;
  isEditing?: boolean;
  parkingareaId?: number
}

async function createParkingArea(
  _: string,
  { arg }: { arg: ParkingAreaFormData }
) {
  const payload = ParkingAreaSchema.parse(arg);
  await axiosInstance.post("/slots/parkingareas/", payload);
}

export default function ParkingAreaForm({ onSuccess, initialValues, isEditing = false, parkingareaId }: ParkingAreaFormProps) {

  const form = useForm<ParkingAreaFormData>({
    resolver: zodResolver(ParkingAreaSchema),
    defaultValues: initialValues ?? {
      name: "",
      description: "",
      rate_per_hour: 0,
    },
  });

  const { trigger, isMutating } = useSWRMutation("/slots/parkingareas/", createParkingArea);

  const onSubmit = async (values: ParkingAreaFormData) => {
  try {
    if (isEditing && parkingareaId) {
      // Editing
      await axiosInstance.patch(`/slots/parkingareas/${parkingareaId}/`, values);
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

            <FormField control={form.control} name="rate_per_hour" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Per Hour(Ksh.)</FormLabel>
                    <FormControl>
                          <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)
                      }
                    />
                    </FormControl>
                  </FormItem>
                )}
              />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <Button type="submit" disabled={isMutating}>
              {isMutating ? isEditing ? "Saving…" : "Creating…" : isEditing ? "Save" : "Create Parking Area"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
