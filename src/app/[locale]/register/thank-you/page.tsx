import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <CheckCircle className="mx-auto text-green-500 h-16 w-16 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Merci pour votre inscription !
        </h1>
        <p className="text-gray-600 mb-6">
          Un email contenant vos identifiants temporaires a été envoyé. Vous
          pouvez maintenant vous connecter à votre tableau de bord.
        </p>
        <Link
          href="/login"
          className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-md"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}
