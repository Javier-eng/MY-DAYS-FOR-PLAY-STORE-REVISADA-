import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
 
export const meta: MetaFunction = () => [
  { title: "My Days App" },
  { name: "viewport", content: "width=device-width,initial-scale=1" }
];
 
export default function App() {
  return (
    <html lang="es">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}