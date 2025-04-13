
interface PageLayoutProps {
  children: React.ReactNode;
  HeaderExtra?: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
