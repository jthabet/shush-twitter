import React from "react";
import { createRoot } from "react-dom/client";
import { TokenForm } from "./components/TokenForm";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find root element");
const root = createRoot(rootElement);
root.render(
  <div className="mx-auto mt-10 grid grid-flow-row auto-rows-max justify-items-center">
    <TokenForm />
  </div>
);
