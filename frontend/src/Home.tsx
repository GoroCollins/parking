import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, DollarSign, ParkingCircle, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StatCardProps {
  title: string;
  value: string | number;
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
  const totalSlots = 120;
  const occupiedSlots = 85;
  const availableSlots = totalSlots - occupiedSlots;
  const occupancyRate = Math.round((occupiedSlots / totalSlots) * 100);

  const todayRevenue = 12500; // KES
  const activeSessions = 34;

  return (
    <div className="p-6 space-y-6">
      {/* 🔹 Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your parking system
        </p>
      </div>

      {/* 🔹 Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Slots"
          value={totalSlots}
          icon={<ParkingCircle size={18} />}
        />
        <StatCard
          title="Occupied Slots"
          value={occupiedSlots}
          icon={<Car size={18} />}
        />
        <StatCard
          title="Available Slots"
          value={availableSlots}
          icon={<ParkingCircle size={18} />}
        />
        <StatCard
          title="Today's Revenue"
          value={`KES ${todayRevenue.toLocaleString()}`}
          icon={<DollarSign size={18} />}
          description="+12% from yesterday"
        />
      </div>

      {/* 🔹 Occupancy Section */}
      <Card>
        <CardHeader>
          <CardTitle>Parking Occupancy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2 text-sm text-muted-foreground">
            <span>{occupiedSlots} occupied</span>
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
            <div className="text-3xl font-bold">{activeSessions}</div>
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