import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Products from '../components/Products';
import Wholesale from '../components/Wholesale';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';

export default function Home() {
  return (
    <div className="font-sans text-earth-800 selection:bg-mustard-500/30 selection:text-olive-900">
      <Hero />
      <Products />
      <Testimonials />
      <Wholesale />
      <Contact />
    </div>
  );
}
