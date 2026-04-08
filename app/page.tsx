import WallCalendar from './components/WallCalendar';

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-100 flex items-center justify-center p-4 md:p-12">
      <div className="w-full max-w-7xl">
        {/* Navigation / Header for the demo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-stone-800">SWE Intern Assessment</h1>
          <p className="text-stone-500">Interactive Wall Calendar Component</p>
        </div>

        <WallCalendar />
        
        <footer className="mt-8 text-center text-stone-400 text-xs">
          Built with Next.js, Tailwind CSS, and Framer Motion
        </footer>
      </div>
    </main>
  );
}