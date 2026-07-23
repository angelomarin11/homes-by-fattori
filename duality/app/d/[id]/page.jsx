import LiveDuel from "@/components/duality/LiveDuel";

// Página pública de uma disputa: /d/{id}
//   ?demo=1  → pré-visualização rotulada com dados de exemplo (sem banco)
//   ?lado=a|b → lado pré-selecionado (links de convocação: "vem pro meu lado")
//
// Server component fino: gera o unfurl (OG) do link com o título real da
// disputa — o link compartilhado em WhatsApp/Discord/X mostra "Título — A × B",
// não um link cego. O jogo em si é client (LiveDuel).

export async function generateMetadata({ params }) {
  const fallback = { title: "Duality", description: "Escolha um lado. Mova o mapa. · Pick a side. Move the map." };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return fallback;
  try {
    const res = await fetch(
      `${url}/rest/v1/duels?id=eq.${encodeURIComponent(params.id)}&select=title,side_a,side_b`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 60 } },
    );
    const [d] = await res.json();
    if (!d) return fallback;
    const vs = `${d.side_a} × ${d.side_b}`;
    return {
      title: `${d.title} — Duality`,
      description: `${vs} · escolha um lado, mova o mapa · pick a side, move the map`,
      openGraph: { title: d.title, description: vs, siteName: "Duality" },
      twitter: { card: "summary_large_image", title: d.title, description: vs },
    };
  } catch { return fallback; }
}

export default function DuelPage({ params, searchParams }) {
  const lado = searchParams?.lado || searchParams?.side;
  return (
    <LiveDuel
      duelId={params.id}
      demo={searchParams?.demo === "1"}
      initialSide={lado === "a" || lado === "b" ? lado : null}
    />
  );
}
