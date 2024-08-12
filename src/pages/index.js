import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useEffect, useState } from "react";
import Chatbot from "@/components/Chatbot";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const headRef = useRef();
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleResume = async () => {
    toggleChat();
  };

  const redirect = (e) => {
    e.preventDefault();
    router.push("https://github.com/SpandanM110");
  };

  const randomEffect = () => {
    const original = "Incity".split("");
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
    let iterations = 0;
    const interval = setInterval(() => {
      headRef.current.innerText = headRef.current.innerText
        .split("")
        .map((letter, index) => {
          if (index < iterations) return original[index];
          else return letters[Math.floor(Math.random() * 36)];
        })
        .join("");
      if (iterations >= 6) clearInterval(interval);
      iterations += 1 / 3;
    }, 70);
  };

  useEffect(() => {
    randomEffect();
  }, []);

  return (
    <div>
      <Head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon"></link>
        <title>Incity | Empowering Your Journey</title>
        <meta
          name="description"
          content="Incity is a dynamic platform offering insights into maps, health support, recipes, news updates, and weather information. Explore more about our services and connect with us."
        ></meta>
        <meta
          name="keywords"
          content="Incity, Maps, Health Support, Recipes, News, Weather, Information"
        ></meta>
        <meta name="author" content="Spandan Mukherjee"></meta>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        ></meta>
      </Head>
      <main
        className={`flex min-h-screen max-w-[100vw] flex-col items-center justify-center px-4 md:px-20 lg:px-24 py-10 lg:py-24 relative`}
      >
        <div onClick={handleResume} className={`absolute w-16 md:w-24 aspect-square object-contain bottom-10 right-6 bg-transparent cursor-pointer text-white hover:scale-110 animate-spin-slow hover:animate-spin-slower`}>
          <img src="/hire.png" alt="hire me" className={`h-full`} />
        </div>
        {isOpen ? <Chatbot toggleChat={toggleChat} geminiApiKey={GEMINI_API_KEY} /> : null}
        <section
          className={`w-full h-auto mb-10 flex items-center justify-center gap-8 text-sm md:text-md lg:text-[1.5rem] font-Mono text-gray-500 z-5`}
        >
          <Link
            href={`/maps`}
            className={`hover:text-gray-300 cursor-pointer`}
          >
            Maps
          </Link>
          <Link
            href={`/health`}
            className={`hover:text-gray-300 cursor-pointer`}
          >
            Health Support
          </Link>
          <Link href={`/recipes`} className={`hover:text-gray-300 cursor-pointer`}>
            Recipes
          </Link>
          <Link
            href={`/news`}
            className={`hover:text-gray-300 cursor-pointer`}
          >
            News
          </Link>
          <Link
            href={`/weather`}
            className={`hover:text-gray-300 cursor-pointer`}
          >
            Weather
          </Link>
          <Link
            href={`/finance`}
            className={`hover:text-gray-300 cursor-pointer`}
          >
            Finance
          </Link>
          <Link
            href={`/contact`}
            className={`hover:text-gray-300 cursor-pointer`}
          >
            Contact
          </Link>
        </section>
        <section
          ref={headRef}
          className={`w-full h-auto my-5 text-[2rem] md:text-[4rem] lg:text-[6rem] text-white text-center font-Audiowide z-5`}
        >
          Incity
        </section>
        <section
          className={`w-full lg:w-[50%] h-auto mt-10 flex items-center justify-center text-center text-sm lg:text-[1.15rem] font-Body text-gray-500 z-5`}
        >
          <p>
            Welcome to Incity, where we enhance your daily life with personalized information on maps, health support, recipes, news, and weather. <br />
            <span
              className={`text-gray-50 cursor-pointer font-Mono`}
              onClick={redirect}
            >
              👉 BUIDL of New Gemini Version Product 👈
            </span>
          </p>
        </section>
      </main>
    </div>
  );
}
