import { createBrowserRouter } from "react-router";
import { RootLayout } from "@/layouts/RootLayout";
import { Landing } from "@/pages/Landing";
import { Listings } from "@/pages/Listings";
import { ListingDetail } from "@/pages/ListingDetail";
import { Placeholder } from "@/pages/Placeholder";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "listings", element: <Listings /> },
      { path: "listings/:id", element: <ListingDetail /> },
      { path: "realtors", element: <Placeholder title="Realtors" /> },
      { path: "enablement", element: <Placeholder title="Get Certified" /> },
      { path: "pricing", element: <Placeholder title="Pricing" /> },
      { path: "about", element: <Placeholder title="About INSPECTRA" /> },
      { path: "login", element: <Placeholder title="Log in" /> },
      { path: "register", element: <Placeholder title="Sign up" /> },
      { path: "terms", element: <Placeholder title="Terms of Service" /> },
      { path: "privacy", element: <Placeholder title="Privacy Policy" /> },
      { path: "*", element: <Placeholder title="Page not found" /> },
    ],
  },
]);
