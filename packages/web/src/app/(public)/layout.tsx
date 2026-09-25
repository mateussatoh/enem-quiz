import { PrototypeNotice } from "@/components/common/prototype-notice";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <footer className="border-t">
        <PrototypeNotice />
      </footer>
    </>
  );
}
