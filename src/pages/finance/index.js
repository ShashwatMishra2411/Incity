import React, { useState, useRef, useEffect } from "react";
import { MdOutlineChat } from "react-icons/md";
import { FaWindowClose } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Import the Generative AI SDK
import RootLayout from "../layout";
import ReactMarkDown from "react-markdown";

const FinanceBot = ({ toggleChat = () => {} }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [genAI, setGenAI] = useState(null);
  const [chatSession, setChatSession] = useState(null);

  const chatRef = useRef(null);

  // Initialize the Generative AI model
  const initializeChatbot = async () => {
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `
          Finance Bot Instructions
          1. Introduction
          Bot: "Hello! I'm your Finance Bot. I can help you plan your salary and manage your finances. Let's start by gathering some details about your income and expenses."
          2. Collect User Details
          Bot: "Please provide your monthly salary."
          3. Budget Planning
          Bot: "Based on your salary and expenses, I will suggest how to allocate your budget."
          4. Expense Tracking
          Bot: "Please categorize your expenses into needs, wants, and savings."
          5. Savings Recommendations
          Bot: "To help you achieve your savings goals, I recommend saving a percentage of your income each month."
          6. Investment Advice
          Bot: "If you're interested, I can suggest some basic investment options based on your savings."
          7. Closing
          Bot: "Thank you for using the Finance Bot. If you have any more questions or need further assistance, feel free to ask!"
        `,
      });

      const session = model.startChat({
        history: chatHistory.map((message) => ({
          role: message.role,
          content: message.parts.join(""),
        })),
      });

      setGenAI(model);
      setChatSession(session);
      setChatHistory([
        {
          role: "model",
          parts: ["Hi, I am your Finance Bot. How can I assist you today?"],
        },
      ]);
    } catch (error) {
      console.error("Error initializing chatbot:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeChatbot();
  }, []);

  const handleInput = (e) => {
    setMessageInput(e.target.value);
  };

  const handleChatInput = async () => {
    if (messageInput === "" || !genAI || !chatSession) return;

    setLoading(true);
    try {
      const result = await chatSession.sendMessage(messageInput);
      const responseText = result.response.text();

      setChatHistory([
        ...chatHistory,
        { role: "user", parts: [messageInput] },
        { role: "model", parts: [responseText] },
      ]);
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RootLayout>
      {/* <div className='fixed inset-0 flex items-center justify-center z-20'>
      <div
        className='fixed inset-0 bg-gray-900 bg-opacity-75 z-5'
        onClick={() => { toggleChat(); }}
      /> */}
      <div
        ref={chatRef}
        className="w-full h-[100vh] flex flex-col justify-between backdrop-blur-lg border bg-black border-zinc-600 p-4 shadow-md z-70 font-Mono"
      >
        <button
          onClick={() => {
            toggleChat();
          }}
          className="absolute -top-5 -right-5 z-10 text-red-500 p-2 font-mono"
        >
          {/* <FaWindowClose size={28} /> */}
        </button>
        <div className="flex flex-col gap-2 overflow-y-auto">
          {chatHistory.map((message, index) => (
            <div
              key={message.role + index}
              className={`text-xl ${
                message.role === "user" ? "text-fuchsia-500" : "text-cyan-300"
              } snap-end`}
            >
              <ReactMarkDown>
                {`${
                  message.role === "user" ? "You" : "Finance Bot"
                }: ${message.parts.join("")}`}
              </ReactMarkDown>
            </div>
          ))}
          {loading && <div className="text-center">Loading...</div>}
        </div>
        <div className="flex items-center justify-between rounded-lg bg-white">
          <input
            disabled={loading}
            className="w-full h-full border border-gray-300 px-3 py-2 text-gray-700 rounded-md border-none focus:outline-none"
            placeholder="Type your message"
            onKeyDown={(e) => (e.key === "Enter" ? handleChatInput() : null)}
            onChange={handleInput}
            value={messageInput}
          />
          <button
            className={`bg-[rgba(29,71,253,1)] px-4 py-2 text-white rounded-md shadow-md hover:bg-[#1d46fdd5] disabled:bg-slate-500 focus:outline-none ml-4`}
            disabled={messageInput === "" || loading}
            onClick={() => handleChatInput()}
          >
            <MdOutlineChat size={24} />
          </button>
        </div>
      </div>
      {/* </div> */}
    </RootLayout>
  );
};

export default FinanceBot;
