import "./globals.css";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";


export const metadata = {
  title: "My Todo App",
  description: "An intelligent todo app built with Next.js and Node.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Sidebar>
          {children}
        </Sidebar>
      </body>
    </html>
  );
}
