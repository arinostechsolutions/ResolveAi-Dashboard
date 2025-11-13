export type DashboardOverviewResponse = {
  cityId: string;
  totalReports: number;
  totalByStatus: Record<string, number>;
  createdInPeriod: number;
  engagement: {
    totalLikes: number;
    totalViews: number;
    totalShares: number;
  };
  recentActivity: Array<{
    date: string;
    total: number;
  }>;
};

export type ReportsSummaryResponse = {
  cityId: string;
  range: {
    start?: string;
    end?: string;
  };
  byStatus: Array<{
    status: string;
    total: number;
  }>;
  byType: Array<{
    type: string;
    total: number;
  }>;
  byNeighborhood: Array<{
    neighborhood: string;
    total: number;
  }>;
  timeline: Array<{
    date: string;
    total: number;
  }>;
};

export type TopReportsResponse = {
  cityId: string;
  sortBy: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  results: Array<{
    id: string;
    reportType: string;
    status: string;
    address: string;
    bairro: string | null;
    createdAt: string;
    engagementScore: number;
    likesCount: number;
    viewsCount: number;
    sharesCount: number;
    imageUrl: string | null;
  }>;
};

export type ReportsMapResponse = {
  cityId: string;
  status: string;
  reportType: string | null;
  total: number;
  reports: Array<{
    id: string;
    reportType: string;
    status: string;
    address: string;
    bairro: string | null;
    rua: string | null;
    referencia: string | null;
    imageUrl: string | null;
    createdAt: string;
    engagementScore: number;
    location: {
      lat: number;
      lng: number;
      accuracy: number | null;
      collectedAt: string | null;
    };
  }>;
};


