import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, DollarSign, ParkingCircle, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useTotalParkingSlots } from "./hooks/useParkingSlots";
import { useTotalOccupiedSlots } from "./hooks/useOccupiedSlots";
import { useTotalParkingSessions } from "./hooks/useParkingSessions";
import { useTotalRevenue } from "./hooks/useTotalRevenue";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
}) => (
  <Card className="shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);

const Home: React.FC = () => {
  // 🔹 Mock data (replace with API later)
  const totalSlots = useTotalParkingSlots();
  const occupiedSlots = useTotalOccupiedSlots();
  const total = totalSlots.value ?? 0;
  const occupied = occupiedSlots.value ?? 0;
  const availableSlots = total - occupied;
  const occupancyRate = Math.round((occupied / total) * 100);

  const todayRevenue = useTotalRevenue(); // KES
  const activeSessions = useTotalParkingSessions();

  return (
    <div className="p-6 space-y-6">
      {/* 🔹 Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of the parking system
        </p>
      </div>

      {/* 🔹 Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Slots"
          value={totalSlots.isLoading ? <Skeleton className="h-6 w-16" /> : `${totalSlots.value?.toLocaleString() ?? "-"}`}
          icon={<ParkingCircle size={18} />}
        />
        <StatCard
          title="Occupied Slots"
          value={occupiedSlots.isLoading ? <Skeleton className="h-6 w-16" /> : `${occupiedSlots.value?.toLocaleString() ?? "-"}`}
          icon={<Car size={18} />}
        />
        <StatCard
          title="Available Slots"
          value={availableSlots}
          icon={<ParkingCircle size={18} />}
        />
        <StatCard
          title="Total Revenue"
          value={todayRevenue.isLoading ? <Skeleton className="h-6 w-16" /> : `KES ${todayRevenue.value?.toLocaleString() ?? "-"}`}
          icon={<DollarSign size={18} />}
          // description="+12% from yesterday"
        />
      </div>

      {/* 🔹 Occupancy Section */}
      <Card>
        <CardHeader>
          <CardTitle>Parking Occupancy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2 text-sm text-muted-foreground">
            <span>{occupiedSlots.value} occupied</span>
            <span>{occupancyRate}%</span>
          </div>
          <Progress value={occupancyRate} />
        </CardContent>
      </Card>

      {/* 🔹 Activity / Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeSessions.isLoading ? <Skeleton className="h-6 w-16" /> : `${activeSessions.value?.toLocaleString() ?? "-"}`}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Vehicles currently parked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <TrendingUp className="text-green-500" size={20} />
            <span className="text-sm text-muted-foreground">
              Peak usage during 2PM - 5PM
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;