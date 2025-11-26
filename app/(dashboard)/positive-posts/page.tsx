import { PositivePostsDashboard } from "@/components/dashboard/positive-posts-dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Posts Positivos | Dashboard",
};

export default function PositivePostsPage() {
  return <PositivePostsDashboard />;
}




