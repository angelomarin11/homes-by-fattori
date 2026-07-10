import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import About from "@/components/About";
import HomeReveal from "@/components/HomeReveal";
import Portfolio from "@/components/Portfolio";
import HowItWorks from "@/components/HowItWorks";
import StudioFilm from "@/components/StudioFilm";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import ForRealtors from "@/components/ForRealtors";
import Faq from "@/components/Faq";
import HomesBand from "@/components/HomesBand";
import OrderForm from "@/components/OrderForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <TrustBar />
        <About />
        <HomeReveal />
        <Portfolio />
        <HowItWorks />
        <StudioFilm />
        <Pricing />
        <Testimonials />
        <ForRealtors />
        <Faq />
        <HomesBand />
        <OrderForm />
      </main>
      <Footer />
    </>
  );
}
