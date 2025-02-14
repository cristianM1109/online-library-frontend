import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
      <div
        className={`transition-opacity duration-1000 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 text-center">
          Welcome to Library
        </h1>
        <button
          onClick={() => router.push("/books")}
          className="relative px-8 py-4 text-xl font-bold text-white bg-blue-600 rounded-full shadow-lg transition-all duration-500 hover:scale-110 hover:bg-blue-500 focus:ring focus:ring-blue-300"
        >
          Explore Books
          <span className="absolute top-0 left-0 w-full h-full bg-white opacity-20 rounded-full animate-ping"></span>
        </button>
      </div>
    </div>
  );
}
