import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export const metadata: Metadata = {
  title: 'ProofOfWork',
  description: 'Secure geo-location verification for businesses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}