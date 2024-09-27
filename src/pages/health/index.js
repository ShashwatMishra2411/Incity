import React, { useState, useRef, useEffect } from "react";
import { MdOutlineChat } from "react-icons/md";
import { FaWindowClose } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { HospitalIcon } from "lucide-react";
import RootLayout from "../layout";
import { keyword } from "@/helpers/gemini";

const HealthcareBot = ({ toggleChat = () => {} }) => {
  const router = useRouter();
  const [chatHistory, setChatHistory] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(false);

  const chatRef = useRef(null);

  // Initialize chat history
  useEffect(() => {
    setChatHistory([]);
  }, []);

  const handleInput = (e) => {
    setMessageInput(e.target.value);
  };

  const handleChatInput = async () => {
    if (messageInput === "") return;

    setLoading(true);
    try {
      const response = await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageInput,
          chatHistory,
        }),
      });

      const data = await response.json();

      if (data.response === "1") {
        setChatHistory([
          ...chatHistory,
          { role: "user", text: messageInput },
          {
            role: "model",
            text: "I'm sorry, but I can't help with that. Please contact emergency services or a healthcare professional immediately.",
          },
        ]);
        setResponse(true);
        return;
      }

      setChatHistory([
        ...chatHistory,
        { role: "user", text: messageInput },
        { role: "model", text: data.response },
      ]);
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  async function handleClick(e) {
    console.log(chatHistory);
    if (chatHistory.length < 2) return;
    const key = await keyword(chatHistory[chatHistory.length - 2].text);
    console.log(process.env.NEXT_PUBLIC_PLACES_URL);
    router.push(`/places?query=${key}`);
  }

  return (
    <RootLayout>
      <div ref={chatRef} className="w-full bg-black flex flex-col h-full p-4">
        <div className="flex flex-col gap-2 h-full overflow-y-auto">
          {chatHistory.map((message, index) => (
            <div
              key={message.role + index}
              className={`text-xl ${
                message.role === "user" ? "text-fuchsia-500" : "text-green-400"
              }`}
            >
              <ReactMarkdown>
                {`${message.role === "user" ? "You" : "Health Bot"}: ${
                  message.text
                }`}
              </ReactMarkdown>
            </div>
          ))}
          {loading && <div className="text-center">Loading...</div>}
        </div>
        <div className="flex items-center justify-center">
          <input
            disabled={loading}
            className="w-full border border-gray-300 px-3 py-2 text-gray-700 rounded-md"
            placeholder="Type your message"
            onKeyDown={(e) => (e.key === "Enter" ? handleChatInput() : null)}
            onChange={handleInput}
            value={messageInput}
          />
          <button
            className="bg-blue-500 px-4 py-2 text-white rounded-md"
            disabled={messageInput === "" || loading}
            onClick={handleChatInput}
          >
            <MdOutlineChat size={24} />
          </button>
          <Button onClick={handleClick} className="text-red-500 underline">
            <HospitalIcon />
          </Button>
        </div>
      </div>
    </RootLayout>
  );
};

export default HealthcareBot;
