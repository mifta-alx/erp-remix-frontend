import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { ColorSchemeProvider } from "@context/ColorScheme.jsx";
import { ViewProvider } from "@context/ViewScheme.jsx";
import { getThemeFromRequest } from "./utils/theme.server";
import "./tailwind.css";
import { ErrorView } from "~/views";

type LoaderData = {
  theme: string;
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,100..900;1,100..900&display=swap",
  },
];

export const loader: LoaderFunction = async ({ request }) => {
  const theme = (await getThemeFromRequest(request)) || "light";
  return json<LoaderData>({ theme });
};

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<LoaderData>();

  const currentTheme = data?.theme || "light";

  return (
    <html lang="en" className={currentTheme === "dark" ? "dark" : ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ColorSchemeProvider initialTheme={currentTheme}>
          <ViewProvider>{children}</ViewProvider>
        </ColorSchemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  const errorMessage = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
    ? error.message
    : "Unknown Error";

  const errorDescription =
    isRouteErrorResponse(error) && error.data?.description
      ? error.data.description
      : "Unknown Error";

  const errorStatus = isRouteErrorResponse(error) ? error.status : 500;

  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <ErrorView
          message={errorMessage}
          status={errorStatus}
          description={errorDescription}
          className="min-h-screen"
        />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
