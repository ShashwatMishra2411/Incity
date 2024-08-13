import React, { useState, useRef } from "react";
import axios from "axios";
import { MdSearch, MdOutlineChat } from "react-icons/md";
import { FaWindowClose } from "react-icons/fa";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import Loader from "@/components/Loader";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkDown from "react-markdown";
import RootLayout from "../layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CameraIcon, PackageCheck } from "lucide-react";
import Heading from "@/components/heading";

// Create your API key here https://aistudio.google.com/app/apikey
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
console.log(API_KEY);
const Health = ({ toggleChat = () => {} }) => {
  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Popup ref
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
    } catch (error) {
      setError(`Oops, an error occurred: ${error}`);
      console.log(error);
    }
  };

  const handleChatInput = async () => {
    const message = messageInput.trim();
    if (message === "") return;

    setLoading(true);
    setMessageInput("");
    try {
      updateChatHistory(`Searching for recipes with ${message}...`);
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
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        'Objective: Provide users with specific product recommendations for enhancing their environment based on a provided photo.\n\nInstructions:\n\n1. Analyze the provided photo and suggest specific products that could improve the space.\n2. Return the results as a raw JSON array with the following fields for each product:\n   - `name`: The name of the product.\n   - `imageLink`: A link to an image of the product.\n   - `ProductLink`: A link to purchase the product.\n   - `Description`: A brief description of the product.\n   - `HowItwouldBenefitTheSpaceProvidedIntheImage`: An explanation of how the product would enhance the environment shown in the photo.\n3. Do not include any additional text, explanations, or Markdown formatting. Only provide the JSON array.\n\nExample:\n\n[\n  {\n    "name": "Decorative Throw Pillow",\n    "imageLink": "[image-link]",\n    "ProductLink": "[purchase-link]",\n    "Description": "A vibrant throw pillow to add color and texture.",\n    "HowItwouldBenefitTheSpaceProvidedIntheImage": "Adds a pop of color to neutral decor, making the space more lively."\n  },\n  {\n    "name": "Floor Lamp",\n    "imageLink": "[image-link]",\n    "ProductLink": "[purchase-link]",\n    "Description": "A stylish floor lamp to brighten up the room.",\n    "HowItwouldBenefitTheSpaceProvidedIntheImage": "Improves lighting in the room, making it more inviting and functional."\n  }\n]\n',
    });

    try {
      const imageParts = await fileToGenerativePart(file);
      const result = await model.generateContent([prompt, imageParts]);
      const response = await result.response;
      const text = response.text();
      const parsedResponse = JSON.parse(text);
      setLoading(false);
      setResponse(parsedResponse);
      setPrompt("");
    } catch (error) {
      setError(`Oops, an error occurred: ${error}`);
      console.log(error);
    }
  };
  // title,
  // description,
  // icon: Icon,
  // iconColor,
  // bgColor,
  return (
    <RootLayout>
      <div
        ref={chatRef}
        className=" w-full h-full flex flex-col backdrop-blur-lg bg-black bg-opacity-75 border border-zinc-600 p-0 shadow-md z-70"
      >
        <Heading
          title="Product"
          description="This model recommends products from the image"
          icon={PackageCheck}
          iconColor="text-[#FF9900]"
          bgColor=""
        ></Heading>
        <button
          onClick={() => {
            toggleChat();
          }}
          className="absolute -top-5 -right-5 z-10 text-red-500 p-2"
        >
          {/* <FaWindowClose size={28} /> */}
        </button>
        <div className="flex p-2 flex-col gap-2 h-full overflow-y-auto">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`text-xl ${
                message.role === "user" ? "text-fuchsia-500" : "text-white"
              }`}
            >
              {message.parts}
            </div>
          ))}
          {loading && <Loader />}
          {error && <div className="text-red-500">{error}</div>}
          {response && (
            <div className="text-white">
              {response.map((product, index) => (
                <div
                  key={index}
                  className="border border-gray-300 p-2 rounded-md mb-2"
                >
                  <h3 className="mt-2 text-lg font-bold">{product.name}</h3>
                  <p className="text-white">{product.Description}</p>
                  <p>
                    <strong>Benefit:</strong>{" "}
                    {product.HowItwouldBenefitTheSpaceProvidedIntheImage}
                  </p>
                  <a
                    href={product.ProductLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Buy Now
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex p-2 bg-white rounded-md px-2 justify-between items-center">
          <input
            className="w-full border-none border-gray-300 px-3 py-2 text-gray-700 rounded-md focus:outline-none"
            type="text"
            placeholder="Enter prompt for image"
            value={prompt}
            onChange={handlePromptChange}
          />
          <Label htmlFor="file">
            <CameraIcon className="cursor-pointer"></CameraIcon>
          </Label>
          <Input
            id="file"
            className="w-full mt-2 border border-gray-300 px-3 py-2 text-gray-700 rounded-md focus:outline-none hidden"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          ></Input>
        </div>
        <Button
          className="bg-green-500 px-4 py-2 text-white rounded-md shadow-md hover:bg-green-600 focus:outline-none mt-4"
          onClick={handleImageProcessing}
          disabled={loading}
        >
          Process Image
        </Button>
      </div>
      {/* </div> */}
    </RootLayout>
  );
};

export default Health;
