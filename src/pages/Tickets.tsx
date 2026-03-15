import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket as TicketIcon, Calendar, MapPin, Clock, CheckCircle } from 'lucide-react';

export default function Tickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTickets = async () => {
      try {
        const q = query(
          collection(db, 'tickets'),
          where('user_id', '==', user.uid),
          orderBy('created_at', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedTickets = querySnapshot.docs.map(doc => doc.data());
        setTickets(fetchedTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  if (!user) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Login</h1>
          <p className="text-gray-400">You need to be logged in to view your tickets.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6a00]"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <TicketIcon className="w-10 h-10 text-[#ff6a00]" /> My Tickets
          </h1>
          <p className="text-gray-400">View and manage your purchased tickets.</p>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-zinc-900 p-12 rounded-3xl border border-white/5 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 text-gray-400 mb-6">
              <TicketIcon className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No tickets found</h2>
            <p className="text-gray-400 mb-8">You haven't purchased any tickets yet.</p>
            <a href="/tickets" className="bg-[#ff6a00] hover:bg-[#cc2a00] text-white px-8 py-4 rounded-xl font-bold transition-colors inline-block">
              Buy Tickets Now
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {tickets.map((ticket, index) => (
              <motion.div 
                key={ticket.ticket_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-zinc-900 rounded-3xl border ${ticket.checked_in ? 'border-green-500/30' : 'border-white/10'} overflow-hidden shadow-2xl flex flex-col md:flex-row relative`}
              >
                {/* Status Overlay */}
                {ticket.checked_in && (
                  <div className="absolute top-4 right-4 bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10 backdrop-blur-sm border border-green-500/30">
                    <CheckCircle className="w-4 h-4" /> Used
                  </div>
                )}

                {/* Ticket Info */}
                <div className={`p-8 flex-1 border-b md:border-b-0 md:border-r border-white/10 border-dashed relative ${ticket.checked_in ? 'opacity-70' : ''}`}>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <img src="https://www.kohrongpubcrawl.asia/images/logo-main.png" alt="Logo" className="h-24 grayscale" />
                  </div>
                  
                  <div className="mb-8">
                    <span className="text-[#ff6a00] font-bold tracking-wider uppercase text-sm">Koh Rong Pub Crawl</span>
                    <h2 className="text-3xl font-bold mt-2">General Admission</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Date</span>
                      <span className="font-bold text-lg">{ticket.event_date}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Time</span>
                      <span className="font-bold text-lg">8:00 PM</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</span>
                      <span className="font-bold text-lg">Nest Beach Club</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Ticket ID</span>
                      <span className="font-mono text-sm text-gray-300">{ticket.ticket_id.split('-')[1]}</span>
                    </div>
                  </div>
                </div>
                
                {/* QR Code */}
                <div className={`p-8 bg-white flex flex-col items-center justify-center md:w-64 shrink-0 ${ticket.checked_in ? 'opacity-50 grayscale' : ''}`}>
                  <QRCodeSVG 
                    value={ticket.qr_code} 
                    size={160}
                    level="H"
                    includeMargin={true}
                  />
                  <p className="text-black/50 text-xs mt-4 font-mono text-center">
                    {ticket.checked_in ? 'Already Scanned' : 'Scan at entrance'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
