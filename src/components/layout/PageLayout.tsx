
import Header from "./Header";

interface PageLayoutProps {
  children: React.ReactNode;
  HeaderExtra?: React.ReactNode;
}

export default function PageLayout({ children, HeaderExtra }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header HeaderExtra={HeaderExtra} />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-gray-100 py-4 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} Controle de Recuperação de Setores</p>
      </footer>
    </div>
  );
}
