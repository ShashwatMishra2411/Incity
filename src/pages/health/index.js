
import React, { useState, useRef, useEffect } from "react";
import { MdOutlineChat } from "react-icons/md";
import { FaWindowClose } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Import the Generative AI SDK
import ReactMarkdown from "react-markdown";
import { keyword } from "@/helpers/gemini";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { HospitalIcon } from "lucide-react";
import RootLayout from "../layout";

const HealthcareBot = ({ toggleChat = () => {} }) => {
  const router = useRouter();
  const [chatHistory, setChatHistory] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [genAI, setGenAI] = useState(null);
  const [chatSession, setChatSession] = useState(null);
  const [response, setResponse] = useState(false);

  const chatRef = useRef(null);

  // Initialize the Generative AI model
  const initializeChatbot = async () => {
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `
          Health Bot Instructions
          1. Introduction
          Bot: "Hello! I'm your Health Bot. I'm here to help you with health-related questions and provide guidance on your concerns. Let's start by discussing your current health issue or question."
          2. Collect Health Details
          Bot: "Please describe your health concern or symptoms in detail."
          3. Health Assessment
          Bot: "Based on the information you provide, I'll assess potential causes and suggest possible actions you can take."
          4. Symptom Categorization
          Bot: "Please categorize your symptoms into types such as pain, discomfort, or unusual symptoms."
          5. Health Recommendations
          Bot: "To address your health concern, I recommend specific actions or lifestyle changes based on your symptoms."
          6. Further Advice
          Bot: "If needed, I can suggest additional steps or direct you to professional resources for more comprehensive care."
          7. Closing
          Bot: "Thank you for using the Health Bot. If you have more questions or need further assistance, feel free to ask!"
          Prompt Instructions for Health Bot:

Introduction:

If you feel that the patient is in immediate danger, just return "1" and nothing else.

Start by greeting the user and ask them to describe their current health issue or question in a simple and concise manner.
Example: "Hello! I'm your Health Bot. What health concern can I help you with today?"
Collect Health Details:

Prompt the user to provide details about their symptoms without using any formatting.
Example: "Please describe your symptoms."
Health Assessment:

Assess the information provided and suggest possible causes or actions in a clear and concise way.
Example: "Based on what you shared, here's what might be happening and what you can do."
Symptom Categorization:

Ask the user to categorize their symptoms (e.g., pain, discomfort, unusual symptoms) to better understand their situation.
Example: "Can you tell me if you're experiencing pain, discomfort, or something else?"
Health Recommendations:

Provide specific recommendations based on the symptoms, keeping the advice brief and actionable.
Example: "I suggest you try these steps."
Further Advice:

If necessary, offer additional advice or suggest resources in a straightforward manner.
Example: "If this doesn't help, here's what else you can do."
Closing:

Thank the user and let them know you're available if they have more questions, without any extra formatting or lengthy text.
Example: "Thank you for using the Health Bot. If you have more questions, I'm here to help!"

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
          parts: [
            "Hi, I am your Health Bot. How can I assist you with your health today?",
          ],
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

      if (responseText === "1") {
        setChatHistory([
          ...chatHistory,
          { role: "user", parts: [messageInput] },
          {
            role: "model",
            parts: [
              "I'm sorry, but I can't help with that. Please contact emergency services or a healthcare professional immediately.",
            ],
          },
        ]);
        setResponse(true);
        return;
      }

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

  async function handleClick(e) {
    console.log(chatHistory);
    if (chatHistory.length < 2) return;
    const key = await keyword(
      chatHistory[chatHistory.length - 2].parts.join("")
    );
    console.log(process.env.NEXT_PUBLIC_PLACES_URL);
    router.push(`/places?query=${key}`);
  }
  return (
    <RootLayout>
      <div className="fixed inset-0 flex items-center justify-center z-20">
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 z-5"
          onClick={() => {
            toggleChat();
          }}
        />
        <div
          ref={chatRef}
          className="fixed w-[32rem] flex flex-col h-[40rem] backdrop-blur-lg border bg-zinc-900/500 border-zinc-600 p-4 rounded-lg shadow-md z-70 font-Mono"
        >
          <button
            onClick={() => {
              toggleChat();
            }}
            className="absolute -top-5 -right-5 z-10 text-red-500 p-2 font-mono"
          >
            {/* <FaWindowClose size={28} /> */}
          </button>
          <div className="flex flex-col gap-2 h-full overflow-y-auto">
            {chatHistory.map((message, index) => (
              <div
                key={message.role + index}
                className={`text-xl ${
                  message.role === "user" ? "text-fuchsia-500" : "text-cyan-300"
                } snap-end`}
              >
                <ReactMarkdown>
                  {`${
                    message.role === "user" ? "You" : "Health Bot"
                  }: ${message.parts.join("")}`}
                </ReactMarkdown>
              </div>
            ))}
            {loading && <div className="text-center">Loading...</div>}
          </div>
          <div className="flex items-center justify-center">
            <input
              disabled={loading}
              className="w-full border border-gray-300 px-3 py-2 text-gray-700 rounded-md h-full focus:outline-none"
              placeholder="Type your message"
              onKeyDown={(e) => (e.key === "Enter" ? handleChatInput() : null)}
              onChange={handleInput}
              value={messageInput}
            />
            <button
              className={`bg-[rgba(29,71,253,1)] px-4 py-2 text-white h-full rounded-md shadow-md hover:bg-[#1d46fdd5] disabled:bg-slate-500 focus:outline-none`}
              disabled={messageInput === "" || loading}
              onClick={() => handleChatInput()}
            >
              <MdOutlineChat size={24} />
            </button>
            <Button onClick={handleClick} className="text-red-500 underline">
              <HospitalIcon></HospitalIcon>
            </Button>
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default HealthcareBot;
