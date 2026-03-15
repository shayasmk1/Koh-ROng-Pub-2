import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { CreditCard, ShieldCheck, Clock, Users } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const formatDayOfWeek = (d: Date) => days[d.getDay()];
const formatDayOfMonth = (d: Date) => d.getDate().toString().padStart(2, '0');
const formatMonth = (d: Date) => months[d.getMonth()];

export default function BuyTickets() {
  const { user, signInWithGoogle } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'blocked'>('checking');

  // Check server connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch('/api/test');
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          setServerStatus('connected');
        } else {
          const text = await res.text();
          if (text.includes('Cookie check') || text.includes('Action required')) {
            setServerStatus('blocked');
          }
        }
      } catch (err) {
        setServerStatus('blocked');
      }
    };
    checkConnection();
  }, []);

  const fixConnection = () => {
    // Opening the root URL in a small popup often triggers the platform's auth/cookie flow
    const win = window.open('/', 'fix_connection', 'width=100,height=100');
    setTimeout(() => {
      if (win) win.close();
      window.location.reload();
    }, 2000);
  };
  const [nextDates, setNextDates] = useState<Date[]>([]);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const TICKET_PRICE = 10; // USD

  useEffect(() => {
    const dates: Date[] = [];
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    while (dates.length < 8) {
      const day = currentDate.getDay();
      if (day === 1 || day === 4) { // 1 is Monday, 4 is Thursday
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setNextDates(dates);
  }, []);

  const handlePurchase = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }
    if (!fullName || !email || !whatsapp) {
      setError('Please fill in all contact details.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const amount = quantity * TICKET_PRICE;

      // 1. Create order in Firestore (pending)
      await setDoc(doc(db, 'orders', orderId), {
        order_id: orderId,
        user_id: user.uid,
        event_date: date,
        quantity,
        amount,
        full_name: fullName,
        email: email,
        whatsapp: whatsapp,
        status: 'pending',
        created_at: new Date().toISOString()
      });

      // 2. Call backend to generate ABA PayWay link
      const getReqTimeUtc = () => {
        const d = new Date();
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(d.getUTCDate()).padStart(2, "0");
        const hh = String(d.getUTCHours()).padStart(2, "0");
        const mi = String(d.getUTCMinutes()).padStart(2, "0");
        const ss = String(d.getUTCSeconds()).padStart(2, "0");
        return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
      };

      const reqTime = getReqTimeUtc();
      const expiredDate = new Date(Date.now() + 15 * 60000);
      const expiredDateStr = expiredDate.getUTCFullYear() + 
        String(expiredDate.getUTCMonth() + 1).padStart(2, "0") + 
        String(expiredDate.getUTCDate()).padStart(2, "0") + 
        String(expiredDate.getUTCHours()).padStart(2, "0") + 
        String(expiredDate.getUTCMinutes()).padStart(2, "0") + 
        String(expiredDate.getUTCSeconds()).padStart(2, "0");

      const formData = new FormData();
      formData.append('req_time', reqTime);
      formData.append('amount', amount.toFixed(2));
      formData.append('currency', 'USD');
      formData.append('title', `Koh Rong Pub Crawl - ${quantity} Tickets`);
      formData.append('description', `Tickets for ${date}`);
      formData.append('payment_limit', '1');
      formData.append('expired_date', expiredDateStr);
      formData.append('return_url', `${window.location.origin}/success?order_id=${orderId}`);
      formData.append('merchant_ref_no', orderId);

      const response = await fetch('/api/payway/create', {
        method: 'POST',
        body: formData
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        
        if (text.includes('Cookie check') || text.includes('Action required to load your app')) {
          throw new Error('Your browser is blocking a required security cookie. To fix this, please copy and paste the App URL into a new browser tab, or enable third-party cookies for this site.');
        }
        
        throw new Error(`Server error: ${text.substring(0, 100)}...`);
      }

      const data = await response.json();
      
      // Handle server-side errors
      if (!response.ok) {
        throw new Error(data.message || data.error || `Server error: ${response.status}`);
      }
      
      // Handle ABA PayWay API specific errors
      if (data.status && data.status.code && data.status.code !== "00") {
        throw new Error(`Payment Gateway Error: ${data.status.message || 'Unknown error'}`);
      }
      
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error('Invalid response from payment gateway: No payment URL returned.');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during checkout.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://www.kohrongpubcrawl.asia/images/5.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-4 flex flex-col items-center justify-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4"
          >
            GET YOUR <span className="text-[#ff6a00]">TICKETS</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 font-medium"
          >
            Join the biggest party on the island.
          </motion.p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-24">
        <div className="bg-[#151515] rounded-3xl p-6 md:p-10 border border-white/5 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-8">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#222] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff6a00] transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                placeholder="john@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#222] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff6a00] transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">WhatsApp Number</label>
              <input 
                type="tel" 
                placeholder="+855..." 
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-[#222] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff6a00] transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="w-12 h-12 rounded-xl bg-[#222] border border-white/5 flex items-center justify-center text-xl font-bold hover:bg-[#333] transition-colors"
                >-</button>
                <span className="text-2xl font-bold w-8 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(10, quantity + 1))} 
                  className="w-12 h-12 rounded-xl bg-[#222] border border-white/5 flex items-center justify-center text-xl font-bold hover:bg-[#333] transition-colors"
                >+</button>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Select Date (Mondays & Thursdays)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {nextDates.map((d, i) => {
                const dateString = d.toISOString().split('T')[0];
                const isSelected = date === dateString;
                return (
                  <button 
                    key={i}
                    onClick={() => setDate(dateString)}
                    className={`relative overflow-hidden flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 group ${
                      isSelected 
                        ? 'bg-gradient-to-br from-[#ff6a00]/20 to-[#cc5500]/10 border-[#ff6a00] text-white shadow-[0_0_20px_rgba(255,106,0,0.2)] scale-[1.02]' 
                        : 'bg-gradient-to-br from-[#222] to-[#151515] border-white/5 text-gray-400 hover:border-white/20 hover:bg-[#2a2a2a] hover:-translate-y-1'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#ff6a00] to-transparent opacity-70" />
                    )}
                    <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-[#ff6a00]' : 'text-gray-500'}`}>
                      {formatDayOfWeek(d)}
                    </span>
                    <span className="text-4xl font-black mb-1 tracking-tighter">
                      {formatDayOfMonth(d)}
                    </span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-gray-300' : 'text-gray-600'}`}>
                      {formatMonth(d)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <button 
            onClick={handlePurchase}
            disabled={loading}
            className="w-full bg-[#cc5500] hover:bg-[#e65f00] text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(204,85,0,0.3)]"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <CreditCard className="w-6 h-6" />
                PAY ${(quantity * TICKET_PRICE).toFixed(2)} WITH ABA
              </>
            )}
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-6">
            Secure payment powered by ABA PayWay. Supports Card & QR.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-8">
            <div className="flex items-center gap-3 text-gray-300 font-bold text-sm tracking-wide">
              <ShieldCheck className="w-6 h-6 text-[#ff6a00]" /> SECURE PAYMENTS
            </div>
            <div className="flex items-center gap-3 text-gray-300 font-bold text-sm tracking-wide">
              <Clock className="w-6 h-6 text-[#ff6a00]" /> INSTANT DELIVERY
            </div>
            <div className="flex items-center gap-3 text-gray-300 font-bold text-sm tracking-wide">
              <Users className="w-6 h-6 text-[#ff6a00]" /> GROUP DISCOUNTS
            </div>
            {/* Server Status Indicator */}
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  serverStatus === 'connected' ? 'bg-emerald-500' : 
                  serverStatus === 'blocked' ? 'bg-red-500' : 'bg-amber-500'
                }`} />
                <span className="text-xs text-white/40 uppercase tracking-widest">
                  Server Status: {serverStatus === 'connected' ? 'Connected' : serverStatus === 'blocked' ? 'Connection Blocked' : 'Checking...'}
                </span>
              </div>
              {serverStatus === 'blocked' && (
                <button 
                  onClick={fixConnection}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                >
                  Fix Connection
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
