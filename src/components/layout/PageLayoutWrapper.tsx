
interface PageLayoutWrapperProps {
  children: React.ReactNode;
}

export default function PageLayoutWrapper({ children }: PageLayoutWrapperProps) {
  return (
    <>
      {children}
    </>
  );
}
