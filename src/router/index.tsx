import { createBrowserRouter } from "react-router";
import { RootLayout } from "@/layouts/RootLayout";
import { Landing } from "@/pages/Landing";
import { Listings } from "@/pages/Listings";
import { ListingDetail } from "@/pages/ListingDetail";
import { Realtors } from "@/pages/Realtors";
import { RealtorDetail } from "@/pages/RealtorDetail";
import { GetCertified } from "@/pages/GetCertified";
import { Pricing } from "@/pages/Pricing";
import { About } from "@/pages/About";
import { SignIn } from "@/pages/SignIn";
import { SignUp } from "@/pages/SignUp";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { ResetPassword } from "@/pages/ResetPassword";
import { NotFound } from "@/pages/NotFound";
import { Terms } from "@/pages/Terms";
import { Privacy } from "@/pages/Privacy";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Overview } from "@/pages/dashboard/Overview";
import { Saved } from "@/pages/dashboard/Saved";
import { Inquiries } from "@/pages/dashboard/Inquiries";
import { InquiryDetail } from "@/pages/dashboard/InquiryDetail";
import { Inspections } from "@/pages/dashboard/Inspections";
import { InspectionDetail } from "@/pages/dashboard/InspectionDetail";
import { Account } from "@/pages/dashboard/Account";
import { DashboardNotFound } from "@/pages/dashboard/DashboardNotFound";
import { RealtorDashboardLayout } from "@/layouts/RealtorDashboardLayout";
import { RealtorOverview } from "@/pages/realtor/Overview";
import { RealtorListings } from "@/pages/realtor/Listings";
import { RealtorListingDetail } from "@/pages/realtor/ListingDetail";
import { RealtorListingNew, RealtorListingEdit } from "@/pages/realtor/ListingEditor";
import { RealtorLeads } from "@/pages/realtor/Leads";
import { RealtorLeadDetail } from "@/pages/realtor/LeadDetail";
import { RealtorInspections } from "@/pages/realtor/Inspections";
import { RealtorInspectionDetail } from "@/pages/realtor/InspectionDetail";
import { RealtorVerification } from "@/pages/realtor/Verification";
import { RealtorCertification } from "@/pages/realtor/Certification";
import { RealtorAccount } from "@/pages/realtor/Account";
import { RealtorNotFound } from "@/pages/realtor/RealtorNotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "listings", element: <Listings /> },
      { path: "listings/:id", element: <ListingDetail /> },
      { path: "realtors", element: <Realtors /> },
      { path: "realtors/:id", element: <RealtorDetail /> },
      { path: "enablement", element: <GetCertified /> },
      { path: "pricing", element: <Pricing /> },
      { path: "about", element: <About /> },
      { path: "login", element: <SignIn /> },
      { path: "register", element: <SignUp /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "terms", element: <Terms /> },
      { path: "privacy", element: <Privacy /> },
    ],
  },
  // Seeker dashboard: its own shell (sidebar + topbar), outside the marketing chrome.
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Overview /> },
      { path: "saved", element: <Saved /> },
      { path: "inquiries", element: <Inquiries /> },
      { path: "inquiries/:id", element: <InquiryDetail /> },
      { path: "inspections", element: <Inspections /> },
      { path: "inspections/:id", element: <InspectionDetail /> },
      { path: "account", element: <Account /> },
      { path: "*", element: <DashboardNotFound /> },
    ],
  },
  // Realtor dashboard: its own shell (grouped sidebar + topbar), outside the marketing chrome.
  {
    path: "/realtor",
    element: <RealtorDashboardLayout />,
    children: [
      { index: true, element: <RealtorOverview /> },
      { path: "listings", element: <RealtorListings /> },
      { path: "listings/new", element: <RealtorListingNew /> },
      { path: "listings/:id", element: <RealtorListingDetail /> },
      { path: "listings/:id/edit", element: <RealtorListingEdit /> },
      { path: "leads", element: <RealtorLeads /> },
      { path: "leads/:id", element: <RealtorLeadDetail /> },
      { path: "inspections", element: <RealtorInspections /> },
      { path: "inspections/:id", element: <RealtorInspectionDetail /> },
      { path: "verification", element: <RealtorVerification /> },
      { path: "certification", element: <RealtorCertification /> },
      { path: "account", element: <RealtorAccount /> },
      { path: "*", element: <RealtorNotFound /> },
    ],
  },
  // Standalone: rendered outside RootLayout so it has no global header/footer.
  { path: "*", element: <NotFound /> },
]);
