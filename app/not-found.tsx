import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="eyebrow mb-6">404</p>
      <h1 className="font-playfair text-5xl text-navy md:text-6xl">
        This page doesn&rsquo;t exist.
      </h1>
      <div className="my-8 gold-rule" />
      <p className="max-w-md font-cormorant text-2xl italic text-graytext">
        Like an unfinished sketch, there&rsquo;s nothing here yet.
      </p>
      <Link href="/" className="btn-gold mt-10">
        Back to the Studio
      </Link>
    </main>
  );
}
