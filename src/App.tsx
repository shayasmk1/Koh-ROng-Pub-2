import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BuyTickets from './pages/BuyTickets';
import Schedule from './pages/Schedule';
import FAQ from './pages/FAQ';
import AdminDashboard from './pages/AdminDashboard';
import StaffCheckin from './pages/StaffCheckin';
import TicketSuccess from './pages/TicketSuccess';
import Gallery from './pages/Gallery';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tickets" element={<BuyTickets />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/staff" element={<StaffCheckin />} />
          <Route path="/success" element={<TicketSuccess />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
