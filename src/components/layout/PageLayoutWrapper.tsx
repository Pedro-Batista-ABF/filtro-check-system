
import PageLayout from "./PageLayout";
import UserInfo from "@/components/auth/UserInfo";

interface PageLayoutWrapperProps {
  children: React.ReactNode;
}

export default function PageLayoutWrapper({ children }: PageLayoutWrapperProps) {
  return (
    <PageLayout HeaderExtra={<UserInfo />}>
      {children}
    </PageLayout>
  );
}
