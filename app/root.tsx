import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { ColorSchemeProvider } from './context/ColorScheme';
import { getThemeFromRequest } from "./utils/theme.server";
import "./tailwind.css";

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
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const loader: LoaderFunction = async ({ request }) => {
  const theme = await getThemeFromRequest(request) || 'light';
  return json<LoaderData>({ theme });
};

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<LoaderData>();

  const currentTheme = data?.theme || 'light';

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
          {children}
        </ColorSchemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
