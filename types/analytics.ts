export interface AnalyticsData {
  totalQueries: number;
  totalUploads: number;
  avgConfidence: number;
  topErrors: {
    type: string;
    count: number;
  }[];
  usageByDate: {
    date: string;
    queries: number;
  }[];
  productTypes: {
    type: string;
    count: number;
  }[];
  responseTime: {
    date: string;
    time: number;
  }[];
}