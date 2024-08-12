import React, { useState, useRef, useEffect } from 'react';
import { MdOutlineChat } from 'react-icons/md';
import { FaWindowClose } from 'react-icons/fa';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure your API key is correctly set in your environment
const apiKey = process.env.GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(apiKey);

const WeatherBot = ({ toggleChat = () => {} }) => {
  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Popup ref
  const chatRef = useRef(null);

  // Weather API
  const weather = {
    apiKey: "41f4c6838224961ea3a064692c984d0b", // Ensure this is a valid OpenWeatherMap API key
    fetchWeather: async function (city) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${this.apiKey}`
        );
        if (!response.ok) {
          throw new Error("No weather found.");
        }
        const data = await response.json();
        if (!data.list || data.list.length === 0) {
          throw new Error("No forecast data available.");
        }
        // Get the first 3-hour forecast
        const weatherData = data.list[0];
        return {
          name: data.city.name,
          temp: weatherData.main.temp,
          description: weatherData.weather[0].description,
        };
      } catch (error) {
        throw new Error(`Error fetching weather: ${error.message}`);
      }
    },
  };

  const handleInput = (e) => {
    setMessageInput(e.target.value);
  };

  const handleChatInput = async () => {
    const message = messageInput;
    if (messageInput === '') return;

    setLoading(true);
    try {
      const apiResponse = await weather.fetchWeather(message);
      const suggestions = await generateClothingSuggestions(apiResponse);

      updateChatHistory(apiResponse, suggestions);
      setMessageInput('');
    } catch (error) {
      console.error("Error fetching weather:", error);
      setChatHistory(prev => [
        ...prev,
        { role: 'model', parts: [`Error: ${error.message}`] }
      ]);
      setLoading(false);
    }
  };

  const updateChatHistory = (data, suggestions) => {
    const { name, temp, description } = data;

    const newHistory = [
      ...chatHistory,
      { role: 'user', parts: [messageInput] },
      {
        role: 'model',
        parts: [`Weather in ${name}: ${temp}°C with ${description}. You should wear: ${suggestions}.`],
      },
    ];
    setChatHistory(newHistory);
    setLoading(false);
  };

  const generateClothingSuggestions = async (data) => {
    const { temp, description } = data;
    const message = `The weather is ${temp}°C with ${description}. What should I wear?`;

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: "Provide clothing suggestions based on weather conditions.",
      });

      const chatSession = model.startChat({
        generationConfig: {
          temperature: 1.5,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        },
        history: [],
      });

      const result = await chatSession.sendMessage(message);
      return result.response.text();
    } catch (error) {
      console.error("Error generating clothing suggestions:", error);
      return "Sorry, I couldn't generate suggestions at the moment.";
    }
  };

  const initializeChatbot = async () => {
    setLoading(true);
    try {
      setChatHistory([
        { role: 'model', parts: ['Hi, I am Incity WeatherBot. How can I assist you with weather updates and clothing suggestions?'] }
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

  return (
    <div className='fixed inset-0 flex items-center justify-center z-20'>
      <div
        className='fixed inset-0 bg-gray-900 bg-opacity-75 z-5'
        onClick={() => { toggleChat(); }}
      />
      <div ref={chatRef} className='fixed w-[32rem] h-[40rem] backdrop-blur-lg border bg-zinc-900/500 border-zinc-600 p-4 rounded-lg shadow-md z-70 font-Mono'>
        <button onClick={() => { toggleChat(); }} className='absolute -top-5 -right-5 z-10 text-red-500 p-2 font-mono'>
          <FaWindowClose size={28} />
        </button>
        <div className='flex flex-col gap-2 h-full overflow-y-auto'>
          {chatHistory.map((message, index) => (
            <div key={index} className={`text-xl ${message.role === 'user' ? 'text-fuchsia-500' : 'text-cyan-300'} snap-end`}>
              {`${message.role === 'user' ? 'You' : 'Incity'}: ${message.parts}`}
            </div>
          ))}
          {loading && <div className='text-center'>Loading...</div>}
        </div>
        <div className='flex items-center justify-between'>
          <input
            disabled={loading}
            className='w-full border border-gray-300 px-3 py-2 text-gray-700 rounded-md mt-4 focus:outline-none'
            placeholder='Enter city for weather'
            onKeyDown={(e) => e.key === 'Enter' && handleChatInput()}
            onChange={handleInput}
            value={messageInput}
          />
          <button
            className={`bg-[rgba(29,71,253,1)] px-4 py-2 text-white rounded-md shadow-md hover:bg-[#1d46fdd5] disabled:bg-slate-500 focus:outline-none ml-4`}
            disabled={messageInput === '' || loading}
            onClick={handleChatInput}
          >
            <MdOutlineChat size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeatherBot;
