
import React from "react";
import { Loader2 } from "lucide-react";
import PageLayoutWrapper from "@/components/layout/PageLayoutWrapper";

export default function LoadingState() {
  return (
    <PageLayoutWrapper>
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <h1 className="text-xl font-semibold">Carregando...</h1>
      </div>
    </PageLayoutWrapper>
  );
}
