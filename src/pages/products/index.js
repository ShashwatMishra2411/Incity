import React, { useState, useRef } from "react";
import { CameraIcon, PackageCheck } from "lucide-react";
import RootLayout from "../layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Loader from "@/components/Loader";
import Heading from "@/components/heading";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Client-side logic and interaction
const Health = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatRef = useRef(null);

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
    const imageParts = await fileToGenerativePart(file);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          imageParts: imageParts,
        }),
      });
      const data = await response.json();
      console.log(data);
      setResponse(data);
      setLoading(false);
      setChatHistory((prev) => [
        ...prev,
        { role: "user", parts: prompt },
        { role: "bot", parts: data },
      ]);
    } catch (error) {
      setError(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <RootLayout>
      <div
        ref={chatRef}
        className="w-full h-full flex flex-col backdrop-blur-lg bg-black bg-opacity-75 border p-0 shadow-md z-70"
      >
        <Heading
          title="Product"
          description="This model recommends products from the image"
          icon={PackageCheck}
          iconColor="text-[#FF9900]"
        />
        <div className="flex p-2 flex-col gap-2 h-full overflow-y-auto">
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`${
                chat.role === "bot" ? "bg-gray-800" : "bg-gray-700"
              } p-2 rounded-md text-white`}
            >
              {/* {chat.parts} */}
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
                  <a
                    href={`/places?query=${product.name.replace(/\s+/g, "_")}`}
                  >
                    <h3 className="mt-2 text-lg font-bold">{product.name}</h3>
                    <p className="text-white">{product.Description}</p>
                    <p>
                      <strong>Benefit:</strong>
                      {product.HowItwouldBenefitTheSpaceProvidedIntheImage}
                    </p>
                    <p className="text-white">
                      <strong>Price: </strong>
                      {product.price}
                    </p>
                    <p className="text-white">
                      <strong>Shop Name: </strong>
                      {product.shopName}
                    </p>
                    <p className="text-white">
                      <strong>Address: </strong>
                      {product.shopAddress}
                    </p>
                  </a>
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
        <div className="flex mx-4 p-2 bg-white rounded-md px-2 justify-between items-center">
          <input
            className="w-full border-none px-3 py-2 text-gray-700 rounded-md focus:outline-none"
            type="text"
            placeholder="Enter prompt for image"
            value={prompt}
            onChange={handlePromptChange}
          />
          <Label htmlFor="file">
            <CameraIcon className="cursor-pointer" />
          </Label>
          <Input
            id="file"
            className="hidden"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <Button
          className="bg-green-500 mx-4 py-2 mb-2 text-white text-2xl font-bold rounded-md shadow-md hover:bg-green-600 focus:outline-none mt-4"
          onClick={handleImageProcessing}
          disabled={loading}
        >
          Process Image
        </Button>
      </div>
    </RootLayout>
  );
};

export default Health;
