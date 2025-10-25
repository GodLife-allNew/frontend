import AdminDashboard from "@/pages/ServiceAdmin/List";

export const ADMIN_ROUTES = [
  {
    path: "/adminBoard",
    element: <AdminDashboard />,
    protected: true,
    roles: ["admin"],
    layout: true,
  },
];
