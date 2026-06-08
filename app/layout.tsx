import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Interview Simulator',
  description: 'AI-powered behavioral interview practice with real-time feedback',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        <header className="border-b border-slate-100 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <a href="/" className="font-bold text-slate-800 text-sm tracking-tight">
              Interview<span className="text-indigo-600">AI</span>
            </a>
            <nav className="flex items-center gap-4">
              <a
                href="/practice"
                className="text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium"
              >
                Practice
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
