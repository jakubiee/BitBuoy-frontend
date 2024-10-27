"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const mockData: MeasurementData[] = [
  {
    buoy_serial_number: "B001",
    ambient_temp: 25.5,
    water_temp: 20.3,
    water_pollution: 0.05,
    humidity: 65,
    lat: 40.7128,
    long: -74.006,
    timestamp: new Date("2023-04-01T12:00:00Z"),
  },
  {
    buoy_serial_number: "B001",
    ambient_temp: 26.2,
    water_temp: 20.5,
    water_pollution: 0.06,
    humidity: 63,
    lat: 40.7128,
    long: -74.006,
    timestamp: new Date("2023-04-01T13:00:00Z"),
  },
  {
    buoy_serial_number: "B001",
    ambient_temp: 26.8,
    water_temp: 20.7,
    water_pollution: 0.04,
    humidity: 62,
    lat: 40.7128,
    long: -74.006,
    timestamp: new Date("2023-04-01T14:00:00Z"),
  },
];

const buoys = ["B001", "B002", "B003", "B004", "B005"];

export default function Dashboard() {
  const [selectedBuoys, setSelectedBuoys] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const toggleBuoy = (buoy: string) => {
    setSelectedBuoys((prev) =>
      prev.includes(buoy) ? prev.filter((b) => b !== buoy) : [...prev, buoy]
    );
  };

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
              {selectedBuoys.length > 0
                ? `${selectedBuoys.length} Buoys Selected`
                : "Select Buoys"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {buoys.map((buoy) => (
              <DropdownMenuCheckboxItem
                key={buoy}
                checked={selectedBuoys.includes(buoy)}
                onCheckedChange={() => toggleBuoy(buoy)}
              >
                Buoy {buoy}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range) =>
                setDateRange({ from: range?.from, to: range?.to })
              }
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
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
                  <LineChart data={mockData}>
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
                  <LineChart data={mockData}>
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
                  <LineChart data={mockData}>
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
                  <LineChart data={mockData}>
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
              <MapComponent />
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Buoys</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-4rem)] overflow-auto">
              {buoys.map((buoy) => (
                <Button
                  key={buoy}
                  variant="ghost"
                  className="w-full justify-start mb-2"
                  onClick={() => toggleBuoy(buoy)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        selectedBuoys.includes(buoy)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      } mr-2`}
                    />
                    <div>
                      <p className="text-left font-medium">Buoy {buoy}</p>
                      <p className="text-left text-sm text-muted-foreground">
                        Last active: {format(new Date(), "PPpp")}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
