import { Instagram, MessageCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="https://www.kohrongpubcrawl.asia/images/logo-main.png" alt="Logo" className="h-8 grayscale opacity-80" />
              <span className="font-bold text-xl text-white tracking-tight">Koh Rong <span className="text-[#ff6a00]">Pub Crawl</span></span>
            </div>
            <p className="text-gray-400 max-w-sm">
              The ultimate island party experience. 3 Bars, free shots, DJs, and a beach party under the stars.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Links</h3>
            <ul className="space-y-2">
              <li><Link to="/schedule" className="text-gray-400 hover:text-white transition-colors">Schedule</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/tickets" className="text-gray-400 hover:text-white transition-colors">Buy Tickets</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-[#ff6a00] transition-colors">
                  <Instagram className="h-5 w-5" /> Instagram
                </a>
              </li>
              <li>
                <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-[#1db954] transition-colors">
                  <MessageCircle className="h-5 w-5" /> WhatsApp
                </a>
              </li>
              <li>
                <a href="mailto:hello@kohrongpubcrawl.asia" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Mail className="h-5 w-5" /> Email Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Koh Rong Pub Crawl. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}