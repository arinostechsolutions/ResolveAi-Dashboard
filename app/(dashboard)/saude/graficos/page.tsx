"use client";

import { useState, useMemo } from "react";
import { useCity } from "@/context/city-context";
import { HealthAnalyticsDashboard } from "@/components/dashboard/health/health-analytics-dashboard";

export default function HealthAnalyticsPage() {
  return <HealthAnalyticsDashboard />;
}

