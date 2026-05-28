import "./globals.css";

export const metadata = {
  title: "StatKick - Football Analytics",
  description: "AI-powered football match predictions and simulations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
