import "@/app/utility/tailwind.css";
import { rpcUrl } from "@/core/env";
import clsx from "clsx";
import type { PropsWithChildren, ReactElement } from "react";
import React, { Suspense } from "react";

const robots = process.env.VERCEL_ENV === "production" ? "index,follow" : "noindex,follow";

export default function Root (props: PropsWithChildren): ReactElement {
  return (
    <html lang="en">
      <head>
        <title>jewl.app</title>
        <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0" />
        <meta name="description" content="Tax-efficient on-chain renumeration." />
        <meta name="theme-color" content="#e8eaed" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#3d4043" media="(prefers-color-scheme: dark)" />
        <meta name="robots" content={robots} />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" sizes="32x32" href="/api/logo/32/circle" />
        <link rel="icon" type="image/png" sizes="64x64" href="/api/logo/64/circle" />
        <link rel="apple-touch-icon" type="image/png" sizes="32x32" href="/api/logo/192" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jewl.app/" />
        <meta property="og:title" content="jewl.app" />
        <meta property="og:description" content="Tax-efficient on-chain renumeration." />
        <meta property="og:image" content="/api/preview" />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content="jewl.app" />
        <meta property="twitter:image" content="/api/preview" />
        <meta property="twitter:description" content="Tax-efficient on-chain renumeration." />
        <meta property="rpc-url" content={rpcUrl} />
      </head>
      <body className={clsx(
        "w-doc h-doc flex flex-col justify-center",
        "overflow-hidden select-none",
        "text-slate-800 dark:text-slate-200",
        "bg-l bg-gradient-to-tl animate-gradient",
        "from-violet-200 dark:from-violet-950",
        "via-emerald-200 dark:via-emerald-950",
        "to-violet-200 dark:to-violet-950",
      )}
      >
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <Suspense>{props.children}</Suspense>
      </body>
    </html>
  );
}
