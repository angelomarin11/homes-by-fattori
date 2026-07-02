export const metadata = {
  title: "Duality — escolha um lado, mova o mapa · pick a side, move the map",
  description: "Uma disputa ao vivo onde cada pagamento empurra a fronteira. A live battle where every payment pushes the frontier.",
  openGraph: {
    title: "Duality",
    description: "Escolha um lado. Mova o mapa. · Pick a side. Move the map.",
    siteName: "Duality",
  },
};

// o conteúdo detecta PT/EN/ES no navegador; "pt" aqui é só o fallback do documento
export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body style={{ margin: 0, background: "#0B0A0F" }}>{children}</body>
    </html>
  );
}
