import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contato" className="py-24 relative bg-offwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary-red font-semibold tracking-wider uppercase text-sm mb-4 block">
              Fale Conosco
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-primary-red mb-6">
              Visite nossas lojas
            </h2>
            <p className="text-lg text-earth-800 mb-8 font-light">
              Encontre os melhores produtos naturais pertinho de você em Itupeva-SP.
            </p>

            <div className="space-y-8">
              {/* Unidade 1 */}
              <div className="flex gap-4">
                <div className="mt-1 bg-primary-red/10 p-2 rounded-full text-primary-red h-fit">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-primary-red text-lg">Unidade 01</h4>
                  <p className="text-earth-600 leading-relaxed">
                    Av. Brasil, 567 - Do Pinherinho<br/>
                    Itupeva - SP, 13295-000
                  </p>
                </div>
              </div>

              {/* Unidade 2 */}
              <div className="flex gap-4">
                <div className="mt-1 bg-primary-red/10 p-2 rounded-full text-primary-red h-fit">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-primary-red text-lg">Unidade 02</h4>
                  <p className="text-earth-600 leading-relaxed">
                    R. Jundiaí, 377 - Marchi<br/>
                    Itupeva - SP, 13295-000
                  </p>
                </div>
              </div>
 
              {/* WhatsApp Button */}
              <div className="pt-4">
                <a 
                  href="https://wa.me/5511940546968" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-secondary-green hover:bg-olive-700 text-white px-6 py-3 rounded-xl transition-colors shadow-lg font-medium"
                >
                  <Phone className="w-5 h-5" />
                  <span>Falar no WhatsApp (11) 94054-6968</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Map Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-[400px] lg:h-[500px] bg-earth-100 rounded-3xl overflow-hidden shadow-lg border border-earth-200"
          >
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3662.906963463363!2d-47.059444!3d-23.155278!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cf31367090883d%3A0x5263225881033239!2sAv.%20Brasil%2C%20567%20-%20Setor%20Industrial%2C%20Itupeva%20-%20SP%2C%2013295-000!5e0!3m2!1sen!2sbr!4v1709650000000!5m2!1sen!2sbr" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa das Lojas Temperos D'Casa"
            ></iframe>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
