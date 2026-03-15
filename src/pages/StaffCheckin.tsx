import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Camera, AlertCircle } from 'lucide-react';

export default function StaffCheckin() {
  const { userData } = useAuth();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [ticketData, setTicketData] = useState<any | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'already_checked_in'>('idle');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData?.role !== 'staff' && userData?.role !== 'admin') return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText: string, decodedResult: any) {
      if (decodedText !== scanResult) {
        setScanResult(decodedText);
        handleCheckin(decodedText);
        // Pause scanner after successful read to prevent multiple scans
        scanner.pause(true);
      }
    }

    function onScanFailure(error: any) {
      // handle scan failure, usually better to ignore and keep scanning
      // console.warn(`Code scan error = ${error}`);
    }

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [userData, scanResult]);

  const handleCheckin = async (ticketId: string) => {
    setLoading(true);
    setStatus('idle');
    setTicketData(null);
    setMessage('');

    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      const ticketSnap = await getDoc(ticketRef);

      if (!ticketSnap.exists()) {
        setStatus('error');
        setMessage('Invalid Ticket ID. Ticket not found.');
        return;
      }

      const data = ticketSnap.data();
      setTicketData(data);

      if (data.checked_in) {
        setStatus('already_checked_in');
        setMessage(`Ticket was already checked in at ${new Date(data.checked_in_at).toLocaleString()}`);
        return;
      }

      // Perform Check-in
      const checkinTime = new Date().toISOString();
      
      // Update Ticket
      await updateDoc(ticketRef, {
        checked_in: true,
        checked_in_at: checkinTime,
        checked_in_by: userData?.uid
      });

      // Create Checkin Record
      const checkinId = `CHK-${Date.now()}`;
      await setDoc(doc(db, 'checkins', checkinId), {
        ticket_id: ticketId,
        checkin_time: checkinTime,
        staff_id: userData?.uid
      });

      setStatus('success');
      setMessage('Check-in successful!');

    } catch (error: any) {
      console.error("Check-in error:", error);
      setStatus('error');
      setMessage(error.message || 'An error occurred during check-in.');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setStatus('idle');
    setTicketData(null);
    setMessage('');
    // The scanner will automatically resume if it was paused
  };

  if (userData?.role !== 'staff' && userData?.role !== 'admin') {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-gray-400">You must be a staff member to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-zinc-950">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Staff Check-in</h1>
          <p className="text-gray-400">Scan QR codes to validate tickets.</p>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden">
          
          {/* Scanner Container */}
          <div className={`relative rounded-2xl overflow-hidden bg-black border-2 ${status === 'success' ? 'border-green-500' : status === 'error' ? 'border-red-500' : status === 'already_checked_in' ? 'border-yellow-500' : 'border-white/10'} transition-colors duration-300 mb-6`}>
            <div id="reader" className="w-full"></div>
            
            {/* Overlay for loading state */}
            {loading && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff6a00]"></div>
              </div>
            )}
          </div>

          {/* Status Display */}
          <div className="min-h-[120px] flex flex-col items-center justify-center text-center">
            {status === 'idle' && !loading && (
              <div className="text-gray-400 flex flex-col items-center gap-2">
                <Camera className="w-8 h-8 opacity-50" />
                <p>Position QR code within the frame to scan.</p>
              </div>
            )}

            {status === 'success' && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-green-500 flex flex-col items-center gap-2">
                <CheckCircle className="w-12 h-12" />
                <h3 className="text-xl font-bold">Valid Ticket</h3>
                <p className="text-sm text-green-400/80">{message}</p>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-red-500 flex flex-col items-center gap-2">
                <XCircle className="w-12 h-12" />
                <h3 className="text-xl font-bold">Invalid Ticket</h3>
                <p className="text-sm text-red-400/80">{message}</p>
              </motion.div>
            )}

            {status === 'already_checked_in' && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-yellow-500 flex flex-col items-center gap-2">
                <AlertCircle className="w-12 h-12" />
                <h3 className="text-xl font-bold">Already Scanned</h3>
                <p className="text-sm text-yellow-400/80">{message}</p>
              </motion.div>
            )}
          </div>

          {/* Ticket Details (if scanned) */}
          {ticketData && (
            <div className="mt-6 pt-6 border-t border-white/10 text-sm">
              <div className="grid grid-cols-2 gap-4 text-gray-300">
                <div>
                  <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Ticket ID</span>
                  <span className="font-mono">{ticketData.ticket_id.split('-')[1]}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Event Date</span>
                  <span>{ticketData.event_date}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {status !== 'idle' && (
            <button 
              onClick={resetScanner}
              className="mt-8 w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition-colors"
            >
              Scan Next Ticket
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
