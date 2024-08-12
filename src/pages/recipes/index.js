import React, { useState, useRef } from 'react';
import axios from 'axios';
import { MdSearch, MdOutlineChat } from 'react-icons/md';
import { FaWindowClose } from 'react-icons/fa';

const RecipeChatbot = ({ toggleChat = () => {} }) => {
  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Popup ref
  const chatRef = useRef(null);

  // Function to handle search input
  const handleSearch = async (searchTerm) => {
    if (searchTerm.trim() === '') return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchTerm}`);
      const recipes = response.data.meals || [];
      updateChatHistory(`Here are some recipes with ${searchTerm}:`, recipes);
    } catch (err) {
      setError('Error fetching recipes. Please try again.');
      updateChatHistory('Sorry, there was an error fetching the recipes.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle chat input
  const handleChatInput = async () => {
    const message = messageInput.trim();
    if (message === '') return;

    setLoading(true);
    setMessageInput('');
    try {
      updateChatHistory(`Searching for recipes with ${message}...`);
      await handleSearch(message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Function to update chat history
  const updateChatHistory = (message, recipeData = null) => {
    const newHistory = [
      ...chatHistory,
      { role: 'user', parts: [messageInput] },
      { role: 'model', parts: [message] }
    ];

    if (recipeData) {
      newHistory.push({
        role: 'model',
        parts: recipeData.map(recipe => (
          <div key={recipe.idMeal} className='border border-gray-300 p-2 rounded-md mb-2'>
            <img
              src={recipe.strMealThumb}
              alt={recipe.strMeal}
              className='w-full h-24 object-cover rounded-md'
            />
            <h3 className='mt-2 text-lg font-bold'>{recipe.strMeal}</h3>
            <a
              href={`https://www.themealdb.com/meal/${recipe.idMeal}`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-500 hover:underline'
            >
              View Recipe
            </a>
          </div>
        ))
      });
    }

    setChatHistory(newHistory);
    setLoading(false);
  };

  // Handler for input changes
  const handleInput = (e) => {
    setMessageInput(e.target.value);
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center z-20'>
      <div
        className='fixed inset-0 bg-gray-900 bg-opacity-75 z-5'
        onClick={() => { toggleChat(); }}
      />
      <div ref={chatRef} className='fixed w-[32rem] h-[40rem] backdrop-blur-lg border bg-zinc-900/500 border-zinc-600 p-4 rounded-lg shadow-md z-70'>
        <button onClick={() => { toggleChat(); }} className='absolute -top-5 -right-5 z-10 text-red-500 p-2'>
          <FaWindowClose size={28} />
        </button>
        <div className='flex flex-col gap-2 h-full overflow-y-auto'>
          {chatHistory.map((message, index) => (
            <div key={index} className={`text-xl ${message.role === 'user' ? 'text-fuchsia-500' : 'text-cyan-300'}`}>
              {message.parts}
            </div>
          ))}
          {loading && <div className='text-center'>Loading...</div>}
          {error && <div className='text-red-500'>{error}</div>}
        </div>
        <div className='flex items-center justify-between'>
          <input
            disabled={loading}
            className='w-full border border-gray-300 px-3 py-2 text-gray-700 rounded-md mt-4 focus:outline-none'
            placeholder='Type your ingredient'
            onKeyDown={(e) => (e.key === 'Enter' ? handleChatInput() : null)}
            onChange={handleInput}
            value={messageInput}
          />
          <button
            className={`bg-blue-500 px-4 py-2 text-white rounded-md shadow-md hover:bg-blue-600 disabled:bg-slate-500 focus:outline-none ml-4`}
            disabled={messageInput === '' || loading}
            onClick={() => handleChatInput()}
          >
            <MdSearch size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeChatbot;
