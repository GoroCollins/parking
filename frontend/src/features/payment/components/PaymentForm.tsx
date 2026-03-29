import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createPaymentSchema, type PaymentFormData } from "../types";
import { axiosInstance } from "@/services/apiClient";
import {Form, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import { extractErrorMessage } from "@/utils/errorHandler";
import { AxiosError } from "axios";

interface PaymentFormProps {
  session: number;
  outstandingBalance: number;
  onSuccess: () => void;
}
interface PaymentVoucherResponse {
  details?: string
}
export default function PaymentForm({ session, outstandingBalance, onSuccess,}: PaymentFormProps) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(createPaymentSchema(outstandingBalance)),
    defaultValues: {
      session,
      payment_type: "MPESA",
      amount: 0,
      transaction_reference: "",
    },
    mode: "onChange",
  });

  function buildPaymentPayload(values: PaymentFormData) {
    const payload: any = {
        session: values.session,
        payment_type: values.payment_type,
        amount: values.amount,
        transaction_reference: values.transaction_reference
    };

    return payload;
    }


  const onSubmit = async (values: PaymentFormData) => {
    try {

      const payload = buildPaymentPayload(values);

      await axiosInstance.post("/slots/payments/", payload);

      toast.success("Payment recorded");
      onSuccess();
    } catch (err) {
        const error = err as AxiosError<PaymentVoucherResponse>;
        const message = extractErrorMessage(error);
        toast.error(message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Payment Type */}
        <FormField control={form.control} name="payment_type" render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Type</FormLabel>
              <Select  onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash Payment</SelectItem>
                  <SelectItem value="MPESA">MPESA</SelectItem>
                  <SelectItem value="CARD">Card Payment</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Outstanding balance */}
        {(
          <div className="rounded-md bg-muted p-3 text-sm">
            <span className="font-medium">Outstanding balance:</span>{" "}
            {outstandingBalance.toFixed(2)}
          </div>
        )}


        <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                <FormLabel>Amount Paid</FormLabel>
                <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(Number(e.target.value))}/>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField control={form.control} name="transaction_reference" render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Reference</FormLabel>
                  <Input {...field} placeholder="Transaction reference" />
                  <FormMessage />
                </FormItem>
              )}
            />

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            Save Payment
          </Button>
        </div>
      </form>
    </Form>
  );
}

