import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What's included in the ticket?",
      answer: "Your ticket includes a free welcome shot at all 3 bars we visit, discounted drinks all night, VIP entry to the final beach party, and a free Koh Rong Pub Crawl singlet (while stocks last)."
    },
    {
      question: "Where do we meet?",
      answer: "We meet at Nest Beach Club at 8:00 PM. Look for the guides in the bright orange shirts. Please arrive on time to get your wristband and first free shot."
    },
    {
      question: "Do I need to print my ticket?",
      answer: "No, you don't need to print it. Just show the QR code on your phone to our staff when you arrive at the meeting point."
    },
    {
      question: "What should I wear?",
      answer: "It's a beach party! Wear comfortable clothes and shoes you don't mind getting sandy. Swimwear is totally acceptable."
    },
    {
      question: "Can I buy tickets at the door?",
      answer: "Yes, but they are subject to availability and usually cost more. We highly recommend buying online in advance to secure your spot and get the best price."
    },
    {
      question: "Is there an age limit?",
      answer: "Yes, you must be 18 or older to join the pub crawl. Please bring a valid ID."
    }
  ];

  return (
    <div className="pt-24 pb-24 min-h-screen bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Got <span className="text-[#ff6a00]">Questions?</span></h1>
          <p className="text-xl text-gray-400">Everything you need to know about the Koh Rong Pub Crawl.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-bold text-lg">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-[#ff6a00]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 text-gray-400 border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
