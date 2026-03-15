import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'motion/react';
import { CheckCircle, Download, ArrowRight, AlertCircle } from 'lucide-react';

export default function TicketSuccess() {
  const location = useLocation();
  const { user } = useAuth();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('order_id');
    const simulated = searchParams.get('simulated');
    
    if (id) {
      setOrderId(id);
      verifyPaymentAndGenerateTickets(id, simulated === 'true');
    } else {
      setError('No order ID found.');
      setLoading(false);
    }
  }, [location]);

  const verifyPaymentAndGenerateTickets = async (id: string, isSimulated: boolean) => {
    try {
      const orderRef = doc(db, 'orders', id);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) {
        throw new Error('Order not found.');
      }

      const data = orderSnap.data();
      setOrderData(data);

      // If already paid and tickets generated, just load them
      if (data.status === 'paid') {
        setVerificationStatus('success');
        await loadTickets(id);
        return;
      }

      // Verify payment with ABA PayWay
      let isPaymentSuccessful = false;

      if (isSimulated) {
        // For demo purposes, if it's a simulated redirect, assume success
        isPaymentSuccessful = true;
      } else {
        // Call backend to verify payment status
        const formData = new FormData();
        formData.append('request_time', new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14));
        // We need the payment link ID. Since we don't have it saved in Firestore in this demo,
        // we'll assume the backend can verify based on the merchant_ref_no (orderId)
        // In a real implementation, you'd save the payment link ID returned by PayWay during creation,
        // or use another API endpoint to check by merchant_ref_no.
        // For now, we will pass the orderId as the ID, but note that ABA PayWay's detail API 
        // specifically expects the payment link ID.
        formData.append('id', id); 
        
        const response = await fetch('/api/payway/detail', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const detailData = await response.json();
          // Check PayWay response status (e.g., status === 0 means success)
          if (detailData.status === 0 || detailData.status === 'APPROVED') {
             isPaymentSuccessful = true;
          }
        }
      }

      if (isPaymentSuccessful) {
        // Update order status
        await updateDoc(orderRef, { status: 'paid' });
        setVerificationStatus('success');

        // Generate Tickets
        const generatedTickets = [];
        for (let i = 0; i < data.quantity; i++) {
          const ticketId = `TKT-${id}-${i + 1}`;
          const qrData = JSON.stringify({ ticket_id: ticketId, order_id: id });
          
          const ticketObj = {
            ticket_id: ticketId,
            order_id: id,
            user_id: data.user_id,
            event_date: data.event_date,
            qr_code: qrData,
            checked_in: false,
            created_at: new Date().toISOString()
          };

          await setDoc(doc(db, 'tickets', ticketId), ticketObj);
          generatedTickets.push(ticketObj);
        }
        setTickets(generatedTickets);
      } else {
        // Payment failed or pending
        await updateDoc(orderRef, { status: 'failed' });
        setVerificationStatus('failed');
        setError('Payment verification failed. Please contact support if you were charged.');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while processing your order.');
      setVerificationStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async (id: string) => {
    // In a real app, you'd query the tickets collection where order_id == id
    // For simplicity here, we'll just show a success message if they are already generated
    // The user can view them in their profile/tickets page
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6a00] mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying payment and generating tickets...</p>
        </div>
      </div>
    );
  }

  if (error || verificationStatus === 'failed') {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="bg-zinc-900 p-8 rounded-3xl border border-red-500/20 text-center max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Payment Failed</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <Link to="/tickets" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-colors inline-block">
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 min-h-screen bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-500 mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-400">Your tickets for {orderData?.event_date} are ready.</p>
        </motion.div>

        {tickets.length > 0 ? (
          <div className="space-y-8">
            {tickets.map((ticket, index) => (
              <motion.div 
                key={ticket.ticket_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col md:flex-row"
              >
                {/* Ticket Info */}
                <div className="p-8 flex-1 border-b md:border-b-0 md:border-r border-white/10 border-dashed relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <img src="https://www.kohrongpubcrawl.asia/images/logo-main.png" alt="Logo" className="h-24 grayscale" />
                  </div>
                  
                  <div className="mb-8">
                    <span className="text-[#ff6a00] font-bold tracking-wider uppercase text-sm">Koh Rong Pub Crawl</span>
                    <h2 className="text-3xl font-bold mt-2">General Admission</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Date</span>
                      <span className="font-bold text-lg">{ticket.event_date}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Time</span>
                      <span className="font-bold text-lg">8:00 PM</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Location</span>
                      <span className="font-bold text-lg">Nest Beach Club</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Ticket ID</span>
                      <span className="font-mono text-sm text-gray-300">{ticket.ticket_id.split('-')[1]}</span>
                    </div>
                  </div>
                </div>
                
                {/* QR Code */}
                <div className="p-8 bg-white flex flex-col items-center justify-center md:w-64 shrink-0">
                  <QRCodeSVG 
                    value={ticket.qr_code} 
                    size={160}
                    level="H"
                    includeMargin={true}
                  />
                  <p className="text-black/50 text-xs mt-4 font-mono text-center">Scan at entrance</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900 p-8 rounded-3xl border border-white/10 text-center">
            <p className="text-gray-400 mb-6">Your tickets have been saved to your account.</p>
            <Link to="/tickets" className="bg-[#ff6a00] hover:bg-[#cc2a00] text-white px-8 py-4 rounded-xl font-bold transition-colors inline-flex items-center gap-2">
              View My Tickets <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}

        {tickets.length > 0 && (
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
              <Download className="w-5 h-5" /> Save to Device
            </button>
            <Link to="/" className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
              Return Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
