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
import { Placeholder } from "@/pages/Placeholder";

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
      { path: "login", element: <Placeholder title="Log in" /> },
      { path: "register", element: <Placeholder title="Sign up" /> },
      { path: "terms", element: <Placeholder title="Terms of Service" /> },
      { path: "privacy", element: <Placeholder title="Privacy Policy" /> },
      { path: "*", element: <Placeholder title="Page not found" /> },
    ],
  },
]);
