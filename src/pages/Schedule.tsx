import { motion } from 'motion/react';
import { MapPin, Clock, Music, Beer } from 'lucide-react';

export default function Schedule() {
  const schedule = [
    {
      time: "8:00 PM",
      title: "Meeting Point & Welcome Shots",
      location: "Nest Beach Club",
      description: "Gather at Nest Beach Club. Get your wristbands, meet the crew, and enjoy your first free welcome shot to kick off the night.",
      icon: MapPin,
      color: "text-[#ff6a00]"
    },
    {
      time: "9:30 PM",
      title: "Bar 2: The Warm Up",
      location: "Skybar Koh Rong",
      description: "We move to the second venue. Enjoy panoramic views of the island, drink specials, and another free shot on arrival.",
      icon: Beer,
      color: "text-yellow-500"
    },
    {
      time: "11:00 PM",
      title: "Bar 3: The Party Heats Up",
      location: "Police Beach",
      description: "The music gets louder and the crowd gets wilder. Fire shows, beer pong, and your third free shot.",
      icon: Music,
      color: "text-pink-500"
    },
    {
      time: "12:30 AM",
      title: "The Beach Party",
      location: "Secret Beach Location",
      description: "We end the crawl at a massive beach party. Dance under the stars until sunrise with international DJs.",
      icon: Clock,
      color: "text-blue-500"
    }
  ];

  return (
    <div className="pt-24 pb-24 min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">The <span className="text-[#ff6a00]">Schedule</span></h1>
          <p className="text-xl text-gray-400">Here's what a typical night on the Koh Rong Pub Crawl looks like.</p>
        </div>

        <div className="relative border-l-2 border-white/10 ml-4 md:ml-8 space-y-12">
          {schedule.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative pl-8 md:pl-12"
            >
              <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              
              <div className="bg-zinc-900 rounded-2xl p-6 md:p-8 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                  <h3 className="text-2xl font-bold">{item.title}</h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 text-sm font-medium text-gray-300 w-fit">
                    <Clock className="w-4 h-4 mr-2" />
                    {item.time}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-[#ff6a00] mb-4 font-medium">
                  <MapPin className="w-5 h-5" />
                  {item.location}
                </div>
                
                <p className="text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
