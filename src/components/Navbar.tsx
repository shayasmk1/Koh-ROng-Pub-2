import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, userData, signInWithGoogle, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-black/90 backdrop-blur-md fixed w-full z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <img src="https://www.kohrongpubcrawl.asia/images/logo-main.png" alt="Logo" className="h-8" />
              <span className="font-extrabold text-xl text-white tracking-tight">Koh Rong <span className="text-[#ff6a00]">Pub Crawl</span></span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-bold">Home</Link>
              <Link to="/schedule" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-bold">Schedule</Link>
              <Link to="/gallery" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-bold">Gallery</Link>
              <Link to="/faq" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-bold">FAQ</Link>
              
              {userData?.role === 'admin' && (
                <Link to="/admin" className="text-[#1db954] hover:text-white px-3 py-2 rounded-md font-bold">Admin</Link>
              )}
              {(userData?.role === 'staff' || userData?.role === 'admin') && (
                <Link to="/staff" className="text-[#1db954] hover:text-white px-3 py-2 rounded-md font-bold">Staff</Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center justify-end flex-shrink-0 space-x-4">
            {user ? (
              <button onClick={logout} className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-bold">Logout</button>
            ) : (
              <button onClick={signInWithGoogle} className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-bold">Login</button>
            )}
            
            <Link to="/tickets" className="bg-[#ff6a00] hover:bg-[#cc2a00] text-white px-4 py-2 rounded-full font-bold transition-colors">
              Buy Tickets
            </Link>
          </div>
          
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md font-bold">Home</Link>
            <Link to="/schedule" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md font-bold">Schedule</Link>
            <Link to="/gallery" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md font-bold">Gallery</Link>
            <Link to="/faq" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md font-bold">FAQ</Link>
            
            {userData?.role === 'admin' && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="text-[#1db954] hover:text-white block px-3 py-2 rounded-md font-bold">Admin</Link>
            )}
            {(userData?.role === 'staff' || userData?.role === 'admin') && (
              <Link to="/staff" onClick={() => setIsOpen(false)} className="text-[#1db954] hover:text-white block px-3 py-2 rounded-md font-bold">Staff</Link>
            )}
            
            {user ? (
              <button onClick={() => { logout(); setIsOpen(false); }} className="text-gray-300 hover:text-white block w-full text-left px-3 py-2 rounded-md font-bold">Logout</button>
            ) : (
              <button onClick={() => { signInWithGoogle(); setIsOpen(false); }} className="text-gray-300 hover:text-white block w-full text-left px-3 py-2 rounded-md font-bold">Login</button>
            )}
            
            <Link to="/tickets" onClick={() => setIsOpen(false)} className="bg-[#ff6a00] text-white block px-3 py-2 rounded-md font-bold mt-4 text-center">
              Buy Tickets
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}