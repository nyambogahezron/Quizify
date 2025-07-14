import { Link } from "wouter";
import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-poppins font-bold text-sm">QM</div>
              <span className="font-poppins font-bold text-lg text-text">QuizMaster</span>
            </div>
            <p className="text-text/60 text-sm mt-2">Test your knowledge, challenge your friends</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="#"><a className="text-text/70 hover:text-primary text-sm">About</a></Link>
            <Link href="#"><a className="text-text/70 hover:text-primary text-sm">Privacy</a></Link>
            <Link href="#"><a className="text-text/70 hover:text-primary text-sm">Terms</a></Link>
            <Link href="#"><a className="text-text/70 hover:text-primary text-sm">Contact</a></Link>
            <Link href="#"><a className="text-text/70 hover:text-primary text-sm">Help Center</a></Link>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-text/70 hover:bg-primary/10 hover:text-primary transition">
                <Facebook size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-text/70 hover:bg-primary/10 hover:text-primary transition">
                <Twitter size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-text/70 hover:bg-primary/10 hover:text-primary transition">
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-100 text-center text-text/60 text-sm">
          © {year} QuizMaster. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
