import React, { useState, useRef } from "react";
import axios from "axios";
import { MdSearch } from "react-icons/md";
import { FaWindowClose } from "react-icons/fa";
import Image from "next/image";
import Loader from "@/components/Loader";
import { GoogleGenerativeAI } from "@google/generative-ai";
import RootLayout from "../layout";
import ReactMarkdown from "react-markdown";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const RecipeChatbot = ({ toggleChat = () => {} }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const chatRef = useRef(null);
  const genAI = new GoogleGenerativeAI(API_KEY);

  const fileToGenerativePart = async (file) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  const fetchDataProVision = async () => {
    if (!file || !prompt) {
      alert("Please select an image and enter a prompt");
      return;
    }
    setResponse(null);
    setLoading(true);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      const imageParts = await fileToGenerativePart(file);
      const result = await model.generateContent([prompt, imageParts]);
      const response = await result.response;
      const text = response.text();
      setLoading(false);
      setResponse(text);
      setPrompt("");
      handleSearch(text);
    } catch (error) {
      setError(`Oops, an error occurred: ${error}`);
      console.log(error);
    }
  };

  const handleSearch = async (searchTerm) => {
    if (searchTerm.trim() === "") return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchTerm}`
      );
      const recipes = response.data.meals || [];
      updateChatHistory(`Here are some recipes with ${searchTerm}:`, recipes);
    } catch (err) {
      setError("Error fetching recipes. Please try again.");
      updateChatHistory("Sorry, there was an error fetching the recipes.");
    } finally {
      setLoading(false);
    }
  };

  const handleChatInput = async () => {
    const message = messageInput.trim();
    if (message === "") return;

    setLoading(true);
    setMessageInput("");
    try {
      updateChatHistory(`Searching for recipes with ${message}...`);
      await handleSearch(message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const updateChatHistory = (message, recipeData = null) => {
    const newHistory = [
      ...chatHistory,
      { role: "user", parts: [messageInput] },
      { role: "model", parts: [message] },
    ];

    if (recipeData) {
      newHistory.push({
        role: "model",
        parts: recipeData.map((recipe) => (
          <div
            key={recipe.idMeal}
            className="border border-gray-300 p-2 rounded-md mb-2"
          >
            <img
              src={recipe.strMealThumb}
              alt={recipe.strMeal}
              className="w-full h-24 object-cover rounded-md"
            />
            <h3 className="mt-2 text-lg font-bold">{recipe.strMeal}</h3>
            <a
              href={`https://www.themealdb.com/meal/${recipe.idMeal}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Recipe
            </a>
          </div>
        )),
      });
    }

    setChatHistory(newHistory);
    setLoading(false);
  };

  const handleInput = (e) => {
    setMessageInput(e.target.value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (file && allowedTypes.includes(file.type)) {
      setFile(file);
    } else {
      alert("Please select a valid image file");
      event.target.value = null;
    }
  };

  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleImageProcessing = async () => {
    if (!file || !prompt) {
      alert("Please select an image and enter a prompt");
      return;
    }
    setResponse(null);
    setLoading(true);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      const imageParts = await fileToGenerativePart(file);
      const result = await model.generateContent([prompt, imageParts]);
      const response = await result.response;
      const text = response.text();
      setLoading(false);
      setResponse(text);
      setPrompt("");
      handleSearch(text);
    } catch (error) {
      setError(`Oops, an error occurred: ${error}`);
      console.log(error);
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
        className="w-full h-full flex flex-col justify-between backdrop-blur-lg border bg-black/80 border-zinc-600 p-4 shadow-md z-70"
      >
        <button
          onClick={() => {
            toggleChat();
          }}
          className="absolute top-2 right-2 z-10 text-red-500 p-2"
        ></button>
        <div className="flex flex-col gap-2 h-full justify-between overflow-y-auto">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`text-lg px-4 py-2 rounded-md ${
                message.role === "user"
                  ? "bg-fuchsia-500 text-white self-end"
                  : "bg-cyan-300 text-black self-start"
              }`}
            >
              <ReactMarkdown>{message.parts.toString()}</ReactMarkdown>
            </div>
          ))}
          {loading && <Loader />}
          {error && <div className="text-red-500">{error}</div>}
          {response && (
            <div className="text-cyan-300">
              Response: <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          )}
          <div className="flex flex-col">
            {file && (
              <div className="mt-4">
                <Image
                  src={URL.createObjectURL(file)}
                  alt="Selected file"
                  width={300}
                  height={200}
                  className="rounded-md"
                />
              </div>
            )}
            <div className="mt-4">
              <input
                className="w-full border border-gray-300 px-3 py-2 text-gray-700 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                type="text"
                placeholder="Enter prompt for image"
                value={prompt}
                onChange={handlePromptChange}
              />
              <input
                className="w-full mt-2 border border-gray-300 px-3 py-2 text-gray-700 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <button
                className="w-full bg-green-500 px-4 py-2 text-white rounded-md shadow-md hover:bg-green-600 focus:outline-none mt-4 transition-colors duration-200"
                onClick={handleImageProcessing}
                disabled={loading}
              >
                Process Image
              </button>
            </div>
            <div className="flex items-center mt-4">
              <input
                disabled={loading}
                className="w-full border border-gray-300 px-3 py-2 text-gray-700 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Type your ingredient"
                onKeyDown={(e) =>
                  e.key === "Enter" ? handleChatInput() : null
                }
                onChange={handleInput}
                value={messageInput}
              />
              <button
                className={`bg-blue-500 px-4 py-2 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none ml-4 transition-transform transform-gpu ${
                  loading ? "scale-95" : "hover:scale-105"
                }`}
                disabled={messageInput === "" || loading}
                onClick={() => handleChatInput()}
              >
                <MdSearch size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* </div> */}
    </RootLayout>
  );
};

export default RecipeChatbot;
