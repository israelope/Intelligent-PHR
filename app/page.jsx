import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Intelligent PHR | Your health records, made clear",
  description:
    "Keep health records and medical documents in one private place. Ask questions and get plain-language insights drawn only from your own data.",
};

const features = [
  {
    title: "Structured health records",
    description:
      "Store medications, allergies, medical history and lab results in one organised place, with full create, edit and delete controls.",
    image: "/images/feature-records.jpg",
    alt: "Medicines and a notebook on a wooden desk",
  },
  {
    title: "Document upload",
    description:
      "Upload PDFs, images or text files. The app reads them and adds a plain-language summary and category automatically.",
    image: "/images/feature-upload.jpg",
    alt: "Doctor writing notes on a medical document",
  },
  {
    title: "Ask your own data",
    description:
      "Ask questions in everyday language and get answers grounded only in the records and documents you have stored.",
    image: "/images/feature-ask-ai.jpg",
    alt: "Laptop and documents on a desk",
  },
  {
    title: "Helpful insights",
    description:
      "See brief, non-diagnostic wellbeing tips generated from your data, so you can spot what needs your attention.",
    image: "/images/feature-insights.jpg",
    alt: "Stethoscope and notebook on a desk",
  },
];

const steps = [
  {
    title: "Create your account",
    description: "Register in a minute. Your account is protected by Supabase authentication.",
  },
  {
    title: "Add your information",
    description: "Record health details or upload a medical document to your private storage.",
  },
  {
    title: "Get clear answers",
    description: "Ask a question or refresh insights and read a summary you can actually use.",
  },
];

const faqs = [
  {
    question: "Is my health data private?",
    answer:
      "Yes. Row-level security means every database query is scoped to your account, and uploaded files live in a private storage bucket organised by user ID.",
  },
  {
    question: "Can the app diagnose conditions?",
    answer:
      "No. Every AI feature is designed to summarise and inform, not diagnose. It is not a substitute for advice from a healthcare professional.",
  },
  {
    question: "What kinds of files can I upload?",
    answer: "PDF documents, PNG, JPEG and WebP images, and plain text files, up to 10 MB each.",
  },
  {
    question: "Do I need to bring data from another system?",
    answer:
      "No. You can start from an empty account and add records and documents whenever you are ready.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const primaryHref = user ? "/dashboard" : "/register";
  const primaryLabel = user ? "Go to dashboard" : "Create free account";
  const secondaryHref = user ? "/dashboard/query" : "/login";
  const secondaryLabel = user ? "Ask AI" : "Sign in";

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="bg-brand-600 text-white">
        <header className="border-b border-white/15">
          <nav
            className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4"
            aria-label="Main navigation"
          >
            <Link href="/" className="text-lg font-bold tracking-tight">
              Intelligent PHR
            </Link>
            <div className="hidden items-center gap-6 text-sm md:flex">
              <a href="#features" className="hover:underline">
                Features
              </a>
              <a href="#how-it-works" className="hover:underline">
                How it works
              </a>
              <a href="#privacy" className="hover:underline">
                Privacy
              </a>
              <a href="#faq" className="hover:underline">
                FAQ
              </a>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href={user ? "/dashboard" : "/login"}
                className="rounded-lg px-2 py-2 text-sm font-semibold hover:bg-white/10 sm:px-3"
              >
                {user ? "Dashboard" : "Sign in"}
              </Link>
              <Link
                href={primaryHref}
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 sm:px-4"
              >
                {primaryLabel}
              </Link>
            </div>
          </nav>
        </header>

        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="mb-5 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
              Personal health records, private by design
            </p>
            <h1 className="text-4xl leading-tight font-bold tracking-tight md:text-6xl">
              Your health records,{" "}
              <span className="text-brand-100">organised and easy to understand.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base text-brand-50 md:text-lg">
              Keep medical documents and structured health details together in one secure place.
              Ask questions in plain language and get answers drawn only from your own information.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                {primaryLabel}
              </Link>
              <Link
                href={secondaryHref}
                className="rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                {secondaryLabel}
              </Link>
            </div>
            <p className="mt-6 text-xs text-brand-50">
              Free to use. Informational only, never a substitute for medical advice.
            </p>
          </div>
          <div className="relative h-56 overflow-hidden rounded-2xl shadow-lg md:h-80 lg:h-96">
            <Image
              src="/images/hero-health-records.jpg"
              alt="A laptop, notebook and medication planner on a desk"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </section>
      </div>

      <main>
        <section id="features" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 className="text-2xl font-bold md:text-3xl">Everything you need in one place</h2>
          <p className="mt-3 max-w-2xl text-sm text-gray-600 md:text-base">
            Built around the everyday tasks of managing a personal health record.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={feature.title} className="card p-5">
                <div className="relative mb-4 h-32 overflow-hidden rounded-lg">
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <span className="text-xs font-bold tracking-widest text-brand-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-brand-50 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-2xl font-bold md:text-3xl">How it works</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-xl bg-white p-5 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold">{step.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="privacy" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">Your data stays yours</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
                Privacy is built into the data layer, not bolted on afterwards.
              </p>
              <div className="relative mt-6 h-56 overflow-hidden rounded-xl shadow-xs">
                <Image
                  src="/images/privacy-security.jpg"
                  alt="A phone secured with a lock and chain"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="card p-4">
                <span className="font-semibold text-brand-600">Row-level security.</span> Every
                query can only see rows belonging to your account.
              </li>
              <li className="card p-4">
                <span className="font-semibold text-brand-600">Private file storage.</span> Uploads
                are kept in a private bucket under your own user ID.
              </li>
              <li className="card p-4">
                <span className="font-semibold text-brand-600">Grounded AI answers.</span> The
                assistant uses only information you stored, and says so when it does not know.
              </li>
            </ul>
          </div>
        </section>

        <section id="faq" className="bg-gray-50 py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-5">
            <h2 className="text-2xl font-bold md:text-3xl">Frequently asked questions</h2>
            <div className="mt-6 divide-y divide-gray-200 rounded-xl bg-white px-5 shadow-xs">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-4">
                  <summary className="cursor-pointer font-semibold text-gray-900">
                    {faq.question}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-amber-200 bg-amber-50 px-5 py-6 text-center">
          <p className="mx-auto max-w-3xl text-xs leading-relaxed text-amber-900">
            Intelligent PHR provides informational tools only. It does not diagnose, treat or
            replace professional medical advice. Always speak with a qualified healthcare provider
            about medical decisions.
          </p>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-brand-600">Intelligent PHR</p>
            <p className="mt-1 text-xs text-gray-500">
              Built with Next.js, Supabase, Tailwind CSS and Claude.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <a href="#features" className="hover:underline">
              Features
            </a>
            <a href="#privacy" className="hover:underline">
              Privacy
            </a>
            <a href="#faq" className="hover:underline">
              FAQ
            </a>
            <Link href={user ? "/dashboard" : "/login"} className="hover:underline">
              {user ? "Dashboard" : "Sign in"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
