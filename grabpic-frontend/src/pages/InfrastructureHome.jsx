import React from 'react';
import Navbar from '../components/Infrastructure/Navbar';
import Hero from '../components/Infrastructure/Hero';
import FeatureGrid from '../components/Infrastructure/FeatureGrid';
import PricingTable from '../components/Infrastructure/PricingTable';
import ModelCards from '../components/Infrastructure/ModelCards';
import { Cpu, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => (
  <footer className="py-24 bg-background text-foreground border-t border-border">
    <div className="container max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-accent flex items-center justify-center rounded-md shadow-sm">
              <Cpu className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight">Koyeb Demo</span>
          </div>
          <p className="text-muted-foreground max-w-sm font-normal text-sm leading-relaxed mb-8">
            The next-generation infrastructure for developers building high-performance AI and data applications. 
            Serverless GPUs, global edge network, and one-click model deployment.
          </p>
          <div className="flex gap-2">
            <button className="p-2 bg-secondary border border-border rounded-md hover:bg-border/30 transition-all duration-200"><Twitter size={18} /></button>
            <button className="p-2 bg-secondary border border-border rounded-md hover:bg-border/30 transition-all duration-200"><Github size={18} /></button>
            <button className="p-2 bg-secondary border border-border rounded-md hover:bg-border/30 transition-all duration-200"><Linkedin size={18} /></button>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-[11px] mb-6 text-muted-foreground uppercase tracking-widest">Product</h4>
          <ul className="flex flex-col gap-3 text-sm font-normal text-muted-foreground">
            <li><a href="#" className="hover:text-accent transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">GPUs</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Serverless</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Model Hub</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-[11px] mb-6 text-muted-foreground uppercase tracking-widest">Company</h4>
          <ul className="flex flex-col gap-3 text-sm font-normal text-muted-foreground">
            <li><a href="#" className="hover:text-accent transition-colors">About</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Status</a></li>
          </ul>
        </div>
      </div>
      
      <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 text-[12px] font-normal text-muted-foreground/60 tracking-tight">
        <span>© 2026 Koyeb Demo Infrastructure Inc. All rights reserved.</span>
        <div className="flex gap-8">
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-foreground transition-colors">Compliance</a>
        </div>
      </div>
    </div>
  </footer>
);


const InfrastructureHome = () => {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main>
        <Hero />
        <FeatureGrid />
        <PricingTable />
        <ModelCards />
      </main>
      <Footer />
    </div>
  );
};

export default InfrastructureHome;
