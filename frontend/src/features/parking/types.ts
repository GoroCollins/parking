import { z } from 'zod';

export const ParkingAreaSchema = z.object({
  name: z.string().min(1, 'Parking area name is required'),
  description: z.string().min(1, "Parking area description is required"),
  rate_per_hour: z.number().min(0, "Rate per hour must be at least 0.00"),
});

export type ParkingAreaFormData = z.infer<typeof ParkingAreaSchema>;

export interface ParkingArea extends ParkingAreaFormData {
  id: number;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
};

export const ParkingSlotSchema = z.object({
  name: z.string().min(1, 'Parking slot name is required'),
  description: z.string().min(1, "Parking slot description is required"),
  area: z.number(),
  available: z.boolean()
});

export type ParkingSlotFormData = z.infer<typeof ParkingSlotSchema>;

export interface ParkingSlot extends ParkingSlotFormData {
  id: number;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
  parking_area: string;
  current_session: {
    id: number;
    end_time: string | null;
    paid: boolean;
    amount: number;
  }
};

export const ParkingSessionSchema = z.object({
  slot: z.number(),
});

export type ParkingSessionFormData = z.infer<typeof ParkingSessionSchema>;

export interface ParkingSession extends ParkingSessionFormData {
  id: number;
  start_time: string;
  end_time: string;
  duration: number;
  duration_display: string;
  amount: number;
  created_by: string;
  assigned_by: {
    username: string,
    full_name: string
  };
  slot_name: {
    name: string
  };
};