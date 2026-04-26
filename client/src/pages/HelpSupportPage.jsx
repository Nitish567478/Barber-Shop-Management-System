import React, { useState } from 'react';
import BarberShopLoader from "../components/BarberShopLoader";

const HelpSupportPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    message: '',
  });

  const faqData = {
    general: [
      {
        id: 1,
        question: 'How do I book an appointment?',
        answer:
          'Navigate to "Book Appointment" from your dashboard, select a barber, service, and preferred date/time, then confirm your booking.',
      },
      {
        id: 2,
        question: 'Can I modify my appointment?',
        answer:
          'Yes, you can cancel your current appointment and book a new one. Contact our team directly for changes within 24 hours.',
      },
      {
        id: 3,
        question: 'What is your cancellation policy?',
        answer:
          'You can cancel appointments up to 24 hours before the scheduled time without any charges.',
      },
    ],
    payment: [
      {
        id: 4,
        question: 'What payment methods do you accept?',
        answer:
          'We accept cash, credit cards, debit cards, and digital payment methods like JazzCash, Easypaisa, and bank transfers.',
      },
      {
        id: 5,
        question: 'How can I view my invoices?',
        answer:
          'Go to "My Invoices" in your dashboard to see all your payment history and download invoices.',
      },
      {
        id: 6,
        question: 'Do you offer discounts?',
        answer:
          'Yes! We offer discounts for package bookings and loyalty rewards for regular customers. Ask our staff for details.',
      },
    ],
    services: [
      {
        id: 7,
        question: 'How long does a typical appointment take?',
        answer:
          'Most services take 30-60 minutes depending on the type of service. Specific durations are listed in our services directory.',
      },
      {
        id: 8,
        question: 'What services do you offer?',
        answer:
          'We provide haircuts, shaves, grooming, styling, coloring, and other premium grooming services. Check the Services page for complete details.',
      },
      {
        id: 9,
        question: 'Are walk-ins welcome?',
        answer:
          'We accept walk-ins, but we recommend booking in advance to ensure availability and minimal wait time.',
      },
    ],
    account: [
      {
        id: 10,
        question: 'How do I reset my password?',
        answer:
          'Password reset support is not wired into the app yet. Contact support for help until that page is added.',
      },
      {
        id: 11,
        question: 'How do I update my profile?',
        answer:
          'Go to "My Profile" in your dashboard to update your personal information.',
      },
      {
        id: 12,
        question: 'Can I delete my account?',
        answer:
          'Yes, you can delete your account from Settings. This action is permanent and cannot be undone.',
      },
    ],
  };

  const contactInfo = {
    phone: '+91-9934630687',
    email: 'support@barbershop.com',
    address: 'Barber Shop, Lala Lajpat Nagar Ranchi india',
    hours: 'Monday - Sunday: 09:00 AM - 09:00 PM',
  };

  const filteredFaq = Object.entries(faqData)
    .filter(([key]) => key === selectedCategory)
    .flatMap(([, items]) =>
      items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

  const sendMessage = (e) => {
    e.preventDefault();

    console.log(formData);
    alert('My Message Submitted Successfully!');

    setFormData({
      user_name: '',
      user_email: '',
      message: '',
    });

    setShowPopup(false);
  };

  if (!faqData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white"> 
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-amber-400"></div>
          <p className="mt-4 text-sm uppercase tracking-[0.35em] text-slate-300"><BarberShopLoader /></p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page">
      <main className="theme-shell">
        <div className="theme-hero mb-8">
          <h1 className="text-4xl font-semibold text-white">
            Help & Support
          </h1>
          <p className="mt-3 text-slate-300">
            Find answers to your questions or contact us for assistance
          </p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="theme-input"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="flex gap-2 mb-8 flex-wrap">
              {Object.keys(faqData).map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSearchQuery('');
                  }}
                  className={`rounded-full px-4 py-2 text-sm capitalize transition ${
                    selectedCategory === category
                      ? 'bg-amber-400 text-slate-950'
                      : 'border border-white/15 text-white hover:bg-white/5'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredFaq.length === 0 ? (
                <div className="theme-card text-center py-8">
                  <p className="text-slate-400">
                    No results found. Try a different search.
                  </p>
                </div>
              ) : (
                filteredFaq.map((item) => (
                  <div key={item.id} className="theme-card">
                    <h3 className="mb-2 text-lg font-bold text-amber-300">
                      {item.question}
                    </h3>
                    <p className="text-slate-300">{item.answer}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Contact Section */}
          <div className="lg:col-span-1">
            <div className="theme-card sticky top-24">
              <h2 className="mb-6 border-b border-white/10 pb-4 text-xl font-bold text-white">
                Contact Us
              </h2>

              <div className="space-y-6">
                <div>
                  <p className="mb-2 text-sm text-slate-400">Phone</p>
                  <p className="font-semibold text-slate-100">
                    {contactInfo.phone}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-sm text-slate-400">Email</p>
                  <p className="font-semibold text-slate-100">
                    {contactInfo.email}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-sm text-slate-400">Address</p>
                  <p className="font-semibold text-slate-100">
                    {contactInfo.address}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-sm text-slate-400">Hours</p>
                  <p className="font-semibold text-slate-100">
                    {contactInfo.hours}
                  </p>
                </div>
              </div>

              {/* Button */}
              <button
                className="theme-primary-btn mt-6 w-full"
                onClick={() => setShowPopup(true)}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>

        {/* Popup Form */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-900 text-black rounded-xl p-6 w-full max-w-md relative">

              <button className="absolute top-3 right-3 text-3xl text-gray-500 hover:text-white hover:bg-red-500 transition duration-300 border-none cursor-pointer w-10 h-10 rounded-full flex items-center justify-center"
                onClick={() => setShowPopup(false)}
              >
                ×
              </button>

              <h2 className="text-2xl font-bold mb-4 text-yellow-400">
                Contact Us
              </h2>

              <form onSubmit={sendMessage} className="space-y-4 bg-slate-800 p-4 rounded-lg">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={formData.user_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      user_name: e.target.value,
                    })
                  }
                  className="w-full border border-gray-600 bg-transparent text-white placeholder-gray-400 p-3 rounded-lg outline-none focus:border-amber-400"
                />

                <input
                  type="email"
                  placeholder="Your Email"
                  required
                  value={formData.user_email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      user_email: e.target.value,
                    })
                  }
                  className="w-full border border-gray-600 bg-transparent text-white placeholder-gray-400 p-3 rounded-lg outline-none focus:border-amber-400"
                />

                <textarea
                  rows="4"
                  placeholder="Your Message"
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      message: e.target.value,
                    })
                  }
                  className="w-full border border-gray-600 bg-transparent text-white placeholder-gray-400 p-3 rounded-lg outline-none focus:border-amber-400"

                ></textarea>

                <button
                  type="submit"
                  className="theme-primary-btn w-full"
                >
                  Send Now
                </button>
              </form>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HelpSupportPage;