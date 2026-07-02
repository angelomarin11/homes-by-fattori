export const metadata = {
  title: "Duality — escolha um lado, mova o mapa",
  description: "Uma disputa ao vivo onde cada pagamento empurra a fronteira.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: "#0B0A0F" }}>{children}</body>
    </html>
  );
}
