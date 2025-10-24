import { Shield, Github } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">ProofOfWork</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Secure geo-location verification for businesses using blockchain technology.
              Built on Concordium for enterprise-grade security.
            </p>
            <a
              href="https://github.com/tu5h/ProofOfWork"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </a>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/Features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/HowItWorks" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/UseCases" className="hover:text-white transition-colors">Use Cases</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/DemoVideo" className="hover:text-white transition-colors">Demo Video</Link></li>
              <li><Link href="/Contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

      </div>
    </footer>
  );
}
