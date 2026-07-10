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
  // Standalone: rendered outside RootLayout so it has no global header/footer.
  { path: "*", element: <NotFound /> },
]);
