import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import Isotope from 'isotope-layout';

export default function Gallery() {
  const isotope = useRef<Isotope | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [filterKey, setFilterKey] = useState('*');

  // Generate video sources (1 to 20)
  const videoSources = Array.from({ length: 20 }, (_, i) => `https://www.kohrongpubcrawl.asia/images/${i + 1}.mp4`);

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

  useEffect(() => {
    if (isotope.current) {
      isotope.current.arrange({ filter: filterKey });
    }
  }, [filterKey]);

  const handleVideoLoaded = () => {
    if (isotope.current) {
      isotope.current.layout();
    }
  };

  return (
    <div className="pt-24 pb-24 bg-[#121212] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6"
          >
            ISLAND <span className="text-[#ff6a00]">VIBES</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-xl max-w-2xl mx-auto"
          >
            The ultimate party experience captured in motion.
          </motion.p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-12">
          <button 
            onClick={() => setFilterKey('*')}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${filterKey === '*' ? 'bg-[#ff6a00] text-white' : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'}`}
          >
            ALL
          </button>
          <button 
            onClick={() => setFilterKey('.party')}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${filterKey === '.party' ? 'bg-[#ff6a00] text-white' : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'}`}
          >
            PARTY
          </button>
          <button 
            onClick={() => setFilterKey('.beach')}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${filterKey === '.beach' ? 'bg-[#ff6a00] text-white' : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'}`}
          >
            BEACH
          </button>
        </div>

        {/* Isotope Grid */}
        <div ref={containerRef} className="w-full">
          <div className="gallery-sizer w-full sm:w-1/2 md:w-1/3 lg:w-1/4"></div>
          {videoSources.map((src, idx) => {
            // Randomly assign classes for filtering demo
            const filterClass = idx % 2 === 0 ? 'party' : 'beach';
            return (
              <div key={idx} className={`gallery-item ${filterClass} w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2`}>
                <div className="rounded-2xl overflow-hidden relative group shadow-lg bg-black">
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
