import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Ensure this is correctly imported

function Commute() {
  const [chat, setChat] = useState([{ type: 'bot', text: 'Please enter your destination:' }]);
  const [input, setInput] = useState('');
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinationLat, setDestinationLat] = useState(null);
  const [destinationLng, setDestinationLng] = useState(null);
  const [transportMode, setTransportMode] = useState(null);

  useEffect(() => {
    // Fetch current location when component mounts
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (currentLocation && destination && transportMode === 'Public') {
      getPublicTransport();
    }
  }, [currentLocation, destination, transportMode]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setChat((prevChat) => [
            ...prevChat,
            { type: 'bot', text: `Current Location: (${latitude.toFixed(2)}, ${longitude.toFixed(2)})` },
          ]);
        },
        (error) => {
          setChat((prevChat) => [...prevChat, { type: 'bot', text: 'Unable to retrieve your location' }]);
        }
      );
    } else {
      setChat((prevChat) => [...prevChat, { type: 'bot', text: 'Geolocation is not supported by this browser.' }]);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSend = async () => {
    if (!destination) {
      // Fetch destination coordinates
      try {
        const geocodeResponse = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json`,
          {
            params: {
              address: input,
              key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API, // Replace with your actual API key
            },
          }
        );

        const location = geocodeResponse.data.results[0].geometry.location;
        const { lat, lng } = location;

        setDestination(input);
        setDestinationLat(lat);
        setDestinationLng(lng);

        setChat((prevChat) => [
          ...prevChat,
          { type: 'user', text: input },
          { type: 'bot', text: `Destination: ${input}` },
          { type: 'bot', text: `Destination Coordinates: (${lat.toFixed(2)}, ${lng.toFixed(2)})` },
          { type: 'bot', text: 'Choose your mode of transport:', buttons: ['Public'] },
        ]);
      } catch (error) {
        setChat((prevChat) => [...prevChat, { type: 'bot', text: 'Error fetching destination coordinates' }]);
      }
    } else {
      setChat((prevChat) => [...prevChat, { type: 'user', text: input }]);
    }
    setInput('');
  };

  const handleButtonClick = (mode) => {
    if (mode === 'Public') {
      if (currentLocation && destinationLat && destinationLng) {
        setChat((prevChat) => [
          ...prevChat,
          { type: 'bot', text: `Using coordinates:\nCurrent Location: (${currentLocation.latitude.toFixed(2)}, ${currentLocation.longitude.toFixed(2)})\nDestination: (${destinationLat.toFixed(2)}, ${destinationLng.toFixed(2)})` },
        ]);
        setTransportMode('Public');
      } else {
        setChat((prevChat) => [...prevChat, { type: 'bot', text: 'Please get your current location and set a valid destination first.' }]);
      }
    }
  };
  const getPublicTransport = async () => {
    try {
      const transitResponse = await axios.post(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          origin: {
            location: {
              latLng: {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              },
            },
          },
          destination: {
            location: {
              latLng: {
                latitude: destinationLat,
                longitude: destinationLng,
              },
            },
          },
          travelMode: 'TRANSIT',
          computeAlternativeRoutes: true,
          transitPreferences: {
            routingPreference: 'LESS_WALKING',
            allowedTravelModes: ['TRAIN'],
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API, // Replace with your actual API key
            'X-Goog-FieldMask': 'routes.legs.steps.transitDetails',
          },
        }
      );
  
      const transitData = transitResponse.data.routes[0].legs[0];
      const formattedTransitData = transitData.steps
        .filter(step => step.transitDetails)
        .map(step => ({
          line: step.transitDetails.transitLine.nameShort,
          headsign: step.transitDetails.headsign,
          arrivalTime: step.transitDetails.stopDetails.arrivalTime,
          departureTime: step.transitDetails.stopDetails.departureTime,
        }));
  
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
      const prompt = `Here are your transit details in JSON format:\n${JSON.stringify(formattedTransitData, null, 2)}\nPlease convert this JSON into human-readable text instructions.`;
      const result = await model.generateContent(prompt);
      const geminiResponseText = result.response.text();
  
      setChat((prevChat) => [
        ...prevChat,
        { type: 'bot', text: geminiResponseText },
        { 
          type: 'bot', 
          text: (
            <>
              Google Maps Directions Link: <a href={`https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${destinationLat},${destinationLng}`} target="_blank" rel="noopener noreferrer">View Directions</a>
            </>
          ),
        },
      ]);
    } catch (error) {
      console.error('Error fetching transit data', error);
      setChat((prevChat) => [...prevChat, { type: 'bot', text: 'Error fetching transit data' }]);
    }
  };
  

//   const getPublicTransport = async () => {
//     try {
//       const transitResponse = await axios.post(
//         'https://routes.googleapis.com/directions/v2:computeRoutes',
//         {
//           origin: {
//             location: {
//               latLng: {
//                 latitude: currentLocation.latitude,
//                 longitude: currentLocation.longitude,
//               },
//             },
//           },
//           destination: {
//             location: {
//               latLng: {
//                 latitude: destinationLat,
//                 longitude: destinationLng,
//               },
//             },
//           },
//           travelMode: 'TRANSIT',
//           computeAlternativeRoutes: true,
//           transitPreferences: {
//             routingPreference: 'LESS_WALKING',
//             allowedTravelModes: ['TRAIN'],
//           },
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API, // Replace with your actual API key
//             'X-Goog-FieldMask': 'routes.legs.steps.transitDetails',
//           },
//         }
//       );

//       const transitData = transitResponse.data.routes[0].legs[0];
//       const formattedTransitData = transitData.steps
//         .filter(step => step.transitDetails)
//         .map(step => ({
//           line: step.transitDetails.transitLine.nameShort,
//           headsign: step.transitDetails.headsign,
//           arrivalTime: step.transitDetails.stopDetails.arrivalTime,
//           departureTime: step.transitDetails.stopDetails.departureTime,
//         }));

//       const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
//       const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

//       const prompt = `Here are your transit details in JSON format:\n${JSON.stringify(formattedTransitData, null, 2)}\nPlease convert this JSON into human-readable text instructions.`;
//       const result = await model.generateContent(prompt);
//       const geminiResponseText = result.response.text();

//       setChat((prevChat) => [
//         ...prevChat,
//         { type: 'bot', text: geminiResponseText },
//         { type: 'bot', text: `Google Maps Directions Link: https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${destinationLat},${destinationLng}` },
//       ]);
//     } catch (error) {
//       console.error('Error fetching transit data', error);
//       setChat((prevChat) => [...prevChat, { type: 'bot', text: 'Error fetching transit data' }]);
//     }
//   };

  const handleRestartChat = () => {
    setChat([{ type: 'bot', text: 'Please enter your destination:' }]);
    setInput('');
    setDestination('');
    setCurrentLocation(null);
    setDestinationLat(null);
    setDestinationLng(null);
    setTransportMode(null); // Reset transport mode
  };

  return (
    <div className="flex flex-col h-screen text-black">
      <div className="flex-1 overflow-y-scroll bg-gray-100 p-4 border border-gray-300">
        {chat.map((message, index) => (
          <div key={index} className={`my-2 ${message.type === 'bot' ? 'text-left' : 'text-right'}`}>
            <div className={`inline-block p-3 rounded-lg ${message.type === 'bot' ? 'bg-green-100' : 'bg-blue-100'}`}>
              <p className="m-0">{message.text}</p>
              {message.buttons && (
                <div className="mt-2">
                  {message.buttons.map((button, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleButtonClick(button)}
                      className="bg-blue-500 text-white py-1 px-3 rounded-lg mx-1 hover:bg-blue-600"
                    >
                      {button}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {currentLocation && destinationLat && destinationLng && (
          <div className="mt-4 p-3 bg-gray-200 border border-gray-300 rounded-lg">
            <p className="m-0 text-gray-700">Current Location Coordinates: ({currentLocation.latitude.toFixed(2)}, {currentLocation.longitude.toFixed(2)})</p>
            <p className="m-0 text-gray-700">Destination Coordinates: ({destinationLat.toFixed(2)}, {destinationLng.toFixed(2)})</p>
          </div>
        )}
      </div>
      <div className="p-4 bg-gray-200 border-t border-gray-300">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg ml-2 hover:bg-blue-600"
        >
          Send
        </button>
        <button
          onClick={handleRestartChat}
          className="bg-gray-500 text-white py-2 px-4 rounded-lg ml-2 hover:bg-gray-600"
        >
          Start New Chat
        </button>
      </div>
    </div>
  );
}

export default Commute;
