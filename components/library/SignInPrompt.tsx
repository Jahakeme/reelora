import Link from "next/link";

interface SignInPromptProps {
  title: string;
  description: string;
  callbackPath: string;
}

export default function SignInPrompt({ title, description, callbackPath }: SignInPromptProps) {
  return (
    <div className="max-w-350 mx-auto px-4 sm:px-6 py-20">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-lg font-semibold text-text-primary tracking-tight">{title}</h1>
        <p className="text-sm text-text-secondary mt-1 max-w-md">{description}</p>
        <Link
          href={`/signin?callbackUrl=${encodeURIComponent(callbackPath)}`}
          className="mt-6 inline-flex items-center px-4 py-2 bg-amber-500 text-text-inverse text-xs font-medium rounded-full hover:bg-amber-300 transition-base"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
