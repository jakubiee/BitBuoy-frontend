"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isBefore, subHours } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineProps,
} from "recharts";
import dynamic from "next/dynamic";

// Dynamically import MapComponent with SSR disabled
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
});

type MeasurementData = {
  buoy_serial_number: string;
  ambient_temp: number;
  water_temp: number;
  water_pollution: number;
  humidity: number;
  lat: number;
  long: number;
  timestamp: Date;
};

type Buoy = {
  serial_number: string;
  last_measurement_timestamp: Date | null;
  latitude: number | null;
  longitude: number | null;
};

type BuoyResponse = {
  userId: number;
  buoys: Buoy[];
};

export default function Dashboard() {
  const [buoyData, setBuoyData] = useState<Buoy[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [selectedBuoys, setSelectedBuoys] = useState<string[]>([]);

  const fetchBuoys = async () => {
    try {
      const response = await fetch(
        'https://bitbuoy-backend-production.up.railway.app/user/1/buoys',
        {
          headers: {
            'accept': 'application/json',
            'token': 'securetoken123',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setBuoyData(data.buoys);
      } else {
        console.error('Failed to fetch buoy data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchMeasurements = async () => {
    try {
      const serialNumbers = selectedBuoys.join(",");
      const response = await fetch(
        `https://bitbuoy-backend-production.up.railway.app/measurements/?serial_numbers=${serialNumbers}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            token: "securetoken123",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMeasurements(data);
      } else {
        console.error("Failed to fetch measurement data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (selectedBuoys.length > 0) {
      fetchMeasurements();
    }
  }, [selectedBuoys]);
  useEffect(() => {
    fetchBuoys();
  }, []);

  const toggleBuoy = (serialNumber: string) => {
    setSelectedBuoys((prev) =>
      prev.includes(serialNumber)
        ? prev.filter((id) => id !== serialNumber)
        : [...prev, serialNumber]
    );
  };

  console.log(buoyData);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex justify-between items-center p-4 border-b">
        <div className="w-40 h-10 flex items-center justify-center">
          <img src="/images/logo.svg" alt="BitBouy Logo" className="h-full" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">username</p>
                <p className="text-xs leading-none text-muted-foreground">
                  user@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Top Controls */}
      <div className="flex space-x-4 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {buoyData.length > 0
                ? `${selectedBuoys.length} Buoys Selected`
                : "Select Buoys"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
        {buoyData.map((buoy) => (
          <DropdownMenuCheckboxItem
            key={buoy.serial_number}
            checked={selectedBuoys.includes(buoy.serial_number)}
            onCheckedChange={() => toggleBuoy(buoy.serial_number)}
          >
            {buoy.serial_number}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
        </DropdownMenu>

      </div>

      <div className="flex flex-1 p-4 space-x-4 overflow-hidden">
        <div className="w-[60%] space-y-4 overflow-auto pr-4">
            <Card className="h-1/4">
        <CardHeader>
          <CardTitle>Ambient Temperature</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-4rem)]">
          <ChartContainer
            config={{
              ambient_temp: {
                label: "Ambient Temperature",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={measurements}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => format(new Date(value), "HH:mm")}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="ambient_temp"
                  stroke="var(--color-ambient_temp)"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="h-1/4">
        <CardHeader>
          <CardTitle>Water Temperature</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-4rem)]">
          <ChartContainer
            config={{
              water_temp: {
                label: "Water Temperature",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={measurements}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => format(new Date(value), "HH:mm")}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="water_temp"
                  stroke="var(--color-water_temp)"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="h-1/4">
        <CardHeader>
          <CardTitle>Water Pollution</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-4rem)]">
          <ChartContainer
            config={{
              water_pollution: {
                label: "Water Pollution",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={measurements}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => format(new Date(value), "HH:mm")}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="water_pollution"
                  stroke="var(--color-water_pollution)"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="h-1/4">
        <CardHeader>
          <CardTitle>Humidity</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-4rem)]">
          <ChartContainer
            config={{
              humidity: {
                label: "Humidity",
                color: "hsl(var(--chart-4))",
              },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={measurements}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => format(new Date(value), "HH:mm")}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="var(--color-humidity)"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
        </div>

        <div className="w-[40%] space-y-4 overflow-hidden flex flex-col">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Map</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-4rem)]">
              <MapComponent buoyData={buoyData} />
            </CardContent>
          </Card>
          <Card className="flex-1">
      <CardHeader>
        <CardTitle>Buoys</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)] overflow-auto">
        {buoyData.map((buoy) => {
          const isActive = buoy.last_measurement_timestamp
          ? isBefore(
              subHours(new Date().toISOString(), 2), 
              new Date(buoy.last_measurement_timestamp).toISOString()
            )
          : false;

          return (
            <Button
              key={buoy.serial_number}
              variant="ghost"
              className="w-full justify-start mb-2"
            >
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isActive ? "bg-green-500" : "bg-gray-300"
                  } mr-2`}
                />
                <div>
                  <p className="text-left font-medium">{buoy.serial_number}</p>
                  <p className="text-left text-sm text-muted-foreground">
                    Last active:{" "}
                    {buoy.last_measurement_timestamp
                      ? format(new Date(buoy.last_measurement_timestamp), "PPpp")
                      : "No data"}
                  </p>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
        </div>
      </div>
    </div>
  );
}
