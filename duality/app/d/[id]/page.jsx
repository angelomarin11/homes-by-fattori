"use client";
import LiveDuel from "@/components/duality/LiveDuel";

// Página pública de uma disputa: /d/{id}
// ?demo=1 → pré-visualização rotulada com dados de exemplo (sem banco)
export default function DuelPage({ params, searchParams }) {
  return <LiveDuel duelId={params.id} demo={searchParams?.demo === "1"} />;
}
