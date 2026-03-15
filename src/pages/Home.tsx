import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Calendar, MapPin, CheckCircle2, ChevronRight, Beer, GlassWater, Trophy, Music, PartyPopper, Users, Sparkles, Flame, Heart } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState, useRef } from 'react';
import Isotope from 'isotope-layout';

export default function Home() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const isotope = useRef<Isotope | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (containerRef.current) {
      isotope.current = new Isotope(containerRef.current, {
        itemSelector: '.gallery-item',
        layoutMode: 'masonry',
        percentPosition: true,
        masonry: {
          columnWidth: '.gallery-sizer'
        }
      });
    }
    return () => {
      isotope.current?.destroy();
    };
  }, []);

  const handleVideoLoaded = () => {
    if (isotope.current) {
      isotope.current.layout();
    }
  };

  const videoSources = Array.from({ length: 20 }, (_, i) => `https://www.kohrongpubcrawl.asia/images/${i + 1}.mp4`);

  return (
    <div className="pt-16 bg-[#121212]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://www.kohrongpubcrawl.asia/images/1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-[#ff6a00]/20 text-[#ff6a00] px-4 py-1.5 rounded-full text-sm font-bold tracking-wider mb-8 border border-[#ff6a00]/30"
          >
            <Star className="w-4 h-4 fill-current" />
            THE #1 PARTY IN CAMBODIA
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold mb-2 tracking-tight leading-none"
          >
            KOH RONG
            <br />
            <span className="text-[#ff6a00]">PUB CRAWL</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-200 mt-6 mb-2 font-medium"
          >
            3 Bars • Free Shots • Drinking Games • Live DJs
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-2xl md:text-3xl text-white/90 italic font-light mb-10"
          >
            Beach Party Under The Stars
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link to="/tickets" className="bg-[#ff6a00] hover:bg-[#e65f00] text-white px-8 py-4 rounded-full font-bold text-lg transition-colors shadow-[0_0_20px_rgba(255,106,0,0.4)]">
              BUY TICKET - $10
            </Link>
            <Link to="/schedule" className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white px-8 py-4 rounded-full font-bold text-lg transition-colors">
              VIEW SCHEDULE
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 text-sm font-medium"
          >
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <Calendar className="w-4 h-4 text-[#ff6a00]" />
              MONDAYS & THURSDAYS
            </div>
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <MapPin className="w-4 h-4 text-[#ff6a00]" />
              KOH RONG ISLAND
            </div>
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-[#1db954]" />
              18+ ONLY
            </div>
          </motion.div>
        </div>
      </section>

      {/* Island Vibes Gallery */}
      <section className="py-24 bg-[#121212]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-tight">
                ISLAND <span className="text-[#ff6a00]">VIBES</span>
              </h2>
              <p className="text-gray-400 text-lg">
                Catch a glimpse of the madness. Every Monday and Thursday on the shores of Koh Rong.
              </p>
            </div>
            <Link to="/gallery" className="inline-flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white px-6 py-3 rounded-full font-bold text-sm transition-colors whitespace-nowrap">
              VIEW ALL VIDEOS <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div ref={containerRef} className="w-full">
            <div className="gallery-sizer w-full sm:w-1/2 md:w-1/3 lg:w-1/4"></div>
            {videoSources.map((src, idx) => (
              <div key={idx} className="gallery-item w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2">
                <div className="rounded-2xl overflow-hidden relative group shadow-lg hover:shadow-[#ff6a00]/20 transition-all duration-300 transform hover:-translate-y-1 bg-black">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-auto object-cover"
                    onLoadedData={handleVideoLoaded}
                  >
                    <source src={src} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-24 bg-gradient-to-b from-[#1a1a1a] to-[#121212] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#ff6a00]/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ff6a00]/10 text-[#ff6a00] mb-6 border border-[#ff6a00]/30 shadow-[0_0_30px_rgba(255,106,0,0.2)]"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
              WHAT'S <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6a00] to-[#ff9a44]">INCLUDED</span>
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">Everything you need for an unforgettable night out on the island.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Beer, title: "3 EPIC BARS", desc: "We hit the best spots on the island, carefully selected for maximum vibes." },
              { icon: GlassWater, title: "FREE SHOTS", desc: "A free welcome shot at every single bar to get the party started." },
              { icon: Trophy, title: "DRINKING GAMES", desc: "Beer pong, flip cup, and wild island challenges with prizes." },
              { icon: Music, title: "LIVE DJS", desc: "The best international and local beats to keep you moving all night." },
              { icon: PartyPopper, title: "BEACH AFTERPARTY", desc: "Dance until sunrise on the white sands under the stars." },
              { icon: Users, title: "NEW FRIENDS", desc: "The absolute easiest way to meet fellow travelers from around the world." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                className="group bg-[#222222]/80 backdrop-blur-sm p-8 rounded-3xl border border-white/5 hover:border-[#ff6a00]/50 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(255,106,0,0.15)] hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#ff6a00]/5 rounded-full blur-3xl group-hover:bg-[#ff6a00]/10 transition-colors"></div>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff6a00]/20 to-transparent text-[#ff6a00] mb-6 border border-[#ff6a00]/20 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 uppercase tracking-wide group-hover:text-[#ff6a00] transition-colors">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-lg">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-[#121212] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter">HOW IT <span className="text-[#ff6a00]">WORKS</span></h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">Three simple steps to the best night of your life.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6a00]/30 to-transparent -translate-y-1/2 z-0"></div>

            {[
              { num: "01", title: "MEET THE CREW", desc: "Meet us at the starting point at 7:30 PM. Get your wristband, meet your hosts, and take your first shot.", icon: Users },
              { num: "02", title: "HIT 3 BARS", desc: "We'll guide you through the island's best bars with games, challenges, and free shots at each stop.", icon: Flame },
              { num: "03", title: "BEACH PARTY", desc: "End the night at our legendary beach afterparty under the stars until the sun comes up.", icon: Heart }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, type: "spring" }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full bg-[#1a1a1a] border-4 border-[#ff6a00] flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,106,0,0.3)] relative group">
                  <div className="absolute inset-0 bg-[#ff6a00] rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></div>
                  <step.icon className="w-10 h-10 text-[#ff6a00] group-hover:text-white relative z-10 transition-colors duration-300" />
                  <div className="absolute -top-4 -right-4 w-10 h-10 bg-black rounded-full border-2 border-[#ff6a00] flex items-center justify-center font-bold text-[#ff6a00]">
                    {step.num}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-wider">{step.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Ultimate Experience */}
      <section className="py-24 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl overflow-hidden relative aspect-[4/3] shadow-2xl"
            >
              <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                <source src="https://www.kohrongpubcrawl.asia/images/1.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="inline-flex items-center gap-2 bg-[#ff6a00] text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                  <Star className="w-4 h-4 fill-current" /> TOP RATED
                </div>
                <h3 className="text-3xl font-bold text-white">Unforgettable Nights.</h3>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter leading-none">
                THE <span className="text-[#ff6a00]">ULTIMATE</span><br />EXPERIENCE
              </h2>
              <p className="text-gray-400 text-xl mb-10 leading-relaxed">
                From the first welcome shot to the final dance on the beach, we've curated every moment to ensure you have the best night of your life in Cambodia.
              </p>
              
              <div className="space-y-6">
                {[
                  "PROFESSIONAL PARTY HOSTS",
                  "GUARANTEED GOOD VIBES",
                  "SAFETY FIRST APPROACH"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-5 p-4 rounded-2xl bg-[#222222] border border-white/5 hover:border-[#ff6a00]/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#1db954]/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-[#1db954]" />
                    </div>
                    <span className="font-bold text-lg tracking-wide">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-[#121212] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter">
              DON'T JUST TAKE<br />
              <span className="text-[#ff6a00]">OUR WORD FOR IT.</span>
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10">
              Thousands of travelers have joined the Koh Rong Pub Crawl. Here's what they have to say.
            </p>
            <Link to="/tickets" className="inline-flex items-center gap-2 bg-[#ff6a00] hover:bg-[#e65f00] text-white px-8 py-4 rounded-full font-bold text-lg transition-colors shadow-[0_0_20px_rgba(255,106,0,0.3)]">
              JOIN THE PARTY <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {[
                  { name: "SOPHIE", country: "UK", text: "Best night in Cambodia! The hosts were amazing and I met so many people. The beach party at the end was absolutely insane." },
                  { name: "MAX", country: "GERMANY", text: "Came alone, left with 20 friends. If you're in Koh Rong, you HAVE to do this. The drinking games were hilarious." },
                  { name: "ELENA", country: "SPAIN", text: "The beach party at the end was magical. Worth every cent! The free shots definitely helped get everyone in the mood." },
                  { name: "JAMES", country: "AUSTRALIA", text: "Mate, what a night. Lost my shirt but found my new best friends. 10/10 would crawl again." },
                  { name: "ANNA", country: "CANADA", text: "So well organized and safe. The guides made sure everyone was included and having a great time." }
                ].map((testimonial, idx) => (
                  <div key={idx} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-6">
                    <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 h-full flex flex-col">
                      <div className="flex gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-[#ff6a00] text-[#ff6a00]" />
                        ))}
                      </div>
                      <p className="text-lg italic text-gray-300 mb-8 flex-grow leading-relaxed">"{testimonial.text}"</p>
                      <div className="flex items-center gap-4 mt-auto pt-6 border-t border-white/10">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ff6a00] to-[#cc2a00] flex items-center justify-center text-xl font-bold text-white shadow-lg">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg tracking-wide">{testimonial.name}</h4>
                          <p className="text-sm text-[#ff6a00] font-medium">{testimonial.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Dots */}
            <div className="flex justify-center gap-3 mt-12">
              {[...Array(5)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => emblaApi?.scrollTo(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    selectedIndex === idx ? 'bg-[#ff6a00] w-8' : 'bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
