import "./globals.css";

export const metadata = {
  title: "Intelligent PHR",
  description: "Intelligent Personal Health Record Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
