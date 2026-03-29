import { useState, useContext } from "react";
import { Button } from "@/components/ui/button"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { axiosInstance } from "@/services/apiClient";
import { type ParkingSlot } from "../types";
import PaymentForm from "@/features/payment/components/PaymentForm";
import { extractErrorMessage } from "@/utils/errorHandler";
import { AuthContext } from "@/authentication/context/AuthContext";

interface ParkingSlotActionsProps {
  slot: ParkingSlot;
  onUpdate: () => void;
}

export default function ParkingSlotActions({ slot, onUpdate }: ParkingSlotActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const authContext = useContext(AuthContext);
  const userRole = authContext?.user?.role;

  const handleAction = async (action: "assign" | "release" | "checkout") => {
    setLoading(true);
    try {
      await axiosInstance.post(`/slots/parkingslots/${slot.id}/${action}/`);
      toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} successful`);
      onUpdate();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      {/* Assign */}
      {slot.available && (
        <Button onClick={() => handleAction("assign")} disabled={loading}>
          Assign
        </Button>
      )}

      {/* Checkout */}
      {!slot.available && slot.current_session && !slot.current_session.end_time && (
        <Button onClick={() => handleAction("checkout")} disabled={loading}>
          Checkout
        </Button>
      )}

      {/* Pay */}
      {!slot.available && slot.current_session && slot.current_session.end_time && !slot.current_session.paid && (
        <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
          <DialogTrigger asChild>
            <Button disabled={loading}>Pay</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Pay for Slot {slot.name}</DialogTitle>
            </DialogHeader>
            <PaymentForm
              session={slot.current_session.id}
              outstandingBalance={slot.current_session.amount}
              onSuccess={() => {
                setShowPaymentForm(false);
                onUpdate();
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Release only visible for Admins */}
      {!slot.available && !slot.current_session?.paid && slot.current_session?.end_time && userRole === "ADMIN" && (
        <Button
          variant="destructive"
          onClick={() => handleAction("release")}
          disabled={loading}
        >
          Release
        </Button>
      )}
    </div>
  );
}