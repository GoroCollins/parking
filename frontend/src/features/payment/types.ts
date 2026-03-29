import { z } from 'zod';

export const PaymentSchema = z.object({
  payment_type: z.enum(["CASH", "MPESA", "CARD"]),
  transaction_reference: z.string().optional(),
  session: z.number(),
  amount: z.number()
})
.superRefine((data, ctx) => {
    if (data.payment_type != "CASH" && !data.transaction_reference) {
      ctx.addIssue({
        path: ["transaction_reference"],
        message: "Transaction reference is required for non-CASH payments",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const createPaymentSchema = (outstandingBalance: number) =>
    PaymentSchema.superRefine((data, ctx) => {
      const maxAllowed = Math.ceil(outstandingBalance);

      if (data.amount > maxAllowed) {
        ctx.addIssue({
          path: ["amount_paid"],
          message: `Amount exceeds outstanding balance (${maxAllowed})`,
          code: z.ZodIssueCode.custom,
        });
      }
    });

export type PaymentFormData = z.infer<typeof PaymentSchema>;

export interface Payment extends PaymentFormData {
  id: number;
  transaction_date: string;
  receipted_by: string;
  slot: string;
  payment_type_name: string;
};