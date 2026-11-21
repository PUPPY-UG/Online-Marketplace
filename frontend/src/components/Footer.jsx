import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300 border-t border-navy-800 pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-navy-800">
          
          {/* Brand & Project Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-orange flex items-center justify-center text-white font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white">Uni<span className="text-brand-orange">Trade</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              UniTrade is a dedicated campus e-commerce marketplace designed exclusively for students at Uganda Christian University to buy and sell used textbooks, electronics, clothing, and hostel essentials securely within the campus community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Marketplace</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products?category=Textbooks and Academic Materials" className="hover:text-blue-400 transition-colors">
                  Textbooks & Academic Books
                </Link>
              </li>
              <li>
                <Link to="/products?category=Electronics and Gadgets" className="hover:text-blue-400 transition-colors">
                  Laptops & Scientific Calculators
                </Link>
              </li>
              <li>
                <Link to="/products?category=Clothing and Fashion" className="hover:text-blue-400 transition-colors">
                  Campus Fashion & Blazers
                </Link>
              </li>
              <li>
                <Link to="/products?category=Furniture and Accommodation Items" className="hover:text-blue-400 transition-colors">
                  Mattresses & Hostel Hot Plates
                </Link>
              </li>
              <li>
                <Link to="/products?category=Sports and Fitness" className="hover:text-blue-400 transition-colors">
                  Sports Cleats & Dumbbells
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-brand-orange hover:underline font-semibold">
                  Browse All Categories →
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Pickup & Safety Guidelines */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Safety & Pickup</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Trade in designated campus zones: Hamu Mukasa Library, Tech Park, or Guild Canteen.</span>
              </li>
              <li className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Inspect items thoroughly in-person before confirming transaction completion.</span>
              </li>
              <li className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Rate your seller honestly to keep our university marketplace trustworthy.</span>
              </li>
            </ul>
          </div>

          {/* Campus Location & Contacts */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">CONTACT</h3>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
                <span>Uganda christian university , Bishop Barham University college</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-brand-blue flex-shrink-0" />
                <span>bbuc@bbuc.ucu.ac.ug</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>0763218182</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 UniTrade Campus Marketplace. Developed for Uganda Christian University.</p>
          <div className="flex space-x-4 text-slate-400">
            <span>Simulated Payments (MTN MoMo & Airtel)</span>
            <span>•</span>
            <span>Zero Real Financial Transactions</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
