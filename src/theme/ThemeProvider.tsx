"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import rtlPlugin from "@mui/stylis-plugin-rtl";
import type { PropsWithChildren } from "react";
import theme from "./theme";

export default function MuiThemeRegistry({ children }: PropsWithChildren) {
  return (
    <AppRouterCacheProvider
      options={{ key: "mui", stylisPlugins: [rtlPlugin] }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
