import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pasteles/$id")({
  component: PastelLayout,
});

function PastelLayout() {
  return <Outlet />;
}