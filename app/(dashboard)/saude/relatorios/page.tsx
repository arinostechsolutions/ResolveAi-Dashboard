"use client";

import { useState, useMemo } from "react";
import { useCity } from "@/context/city-context";
import { HealthReportsDashboard } from "@/components/dashboard/health/health-reports-dashboard";

export default function HealthReportsPage() {
  return <HealthReportsDashboard />;
}

