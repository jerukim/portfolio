import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import './tailwind.css'
import { GraphMouseWarp } from './components/GraphMouseWarp'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <Meta />
        <Links />
      </head>
      <body className="relative">
        <main className="relative z-10">{children}</main>
        <ScrollRestoration />
        <Scripts />
        <GraphMouseWarp className="-z-10 h-screen w-screen bg-slate-100 absolute top-0 left-0" />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
