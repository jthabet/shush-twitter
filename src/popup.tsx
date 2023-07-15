import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { List } from "./components/List";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

const rootElement = document.getElementById("popup");
if (!rootElement) throw new Error("Failed to find root element");
const root = createRoot(rootElement);
root.render(
  <QueryClientProvider client={queryClient}>
    <List />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
