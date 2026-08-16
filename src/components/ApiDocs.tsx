"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

export function ApiDocs() {
  return (
    <div className="min-h-[80vh] w-full">
      <ApiReferenceReact
        configuration={{
          url: "/openapi.json",
          darkMode: true,
          layout: "modern",
          showSidebar: true,
        }}
      />
    </div>
  );
}
