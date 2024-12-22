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
      <body className="bg-gray-50 text-gray-900">
        <Sidebar>
          {children}
        </Sidebar>
      </body>
    </html>
  );
}
