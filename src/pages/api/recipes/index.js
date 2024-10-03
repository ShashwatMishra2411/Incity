const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { message, chatHistory } = req.body;

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `
  System Instruction for Food Chatbot:
Understanding User Preferences:

Analyze and remember the user's previous food preferences (vegetarian, non-vegetarian, vegan, etc.) based on prior chats.
Adjust recommendations to align with their dietary habits. For example, if the user is vegetarian, suggest vegetarian-friendly dishes and avoid non-vegetarian options.
If the user has expressed an interest in specific cuisines (e.g., Chettinad, North Indian, street food), prioritize dishes from those categories in future recommendations.
Personalized Suggestions:

Offer dish suggestions that match the user’s known preferences (spicy, mild, healthy, etc.). If the user prefers spicy food, highlight dishes like Chettinad chicken or mutton biryani. For health-conscious users, recommend organic or lighter meal options.
Remember the user’s favorite restaurants or food spots mentioned in previous chats, and prioritize these in recommendations.
Regional and Dietary Context:

When making recommendations, consider both the user’s location (Chennai-specific spots) and dietary choices (vegetarian, vegan, gluten-free, etc.).
If the user asks for dishes from specific locations in Chennai (e.g., T. Nagar, Marina Beach), ensure the suggestions are nearby or region-specific, keeping dietary preferences in mind.
Progressive Learning:

Continuously learn from each conversation. If a user shows a change in food preferences (e.g., switching from non-veg to veg), adapt future responses accordingly.
Avoid offering previously disliked dishes or restaurants if the user has indicated a negative experience with them.
Cultural Sensitivity:

Be culturally aware of the importance of certain food habits, especially for users following specific dietary customs (e.g., Jain, Hindu, Muslim dietary restrictions). Ensure that recommendations respect these practices.
Handling Specific Requests:

If a user explicitly asks for recommendations within a dietary framework, such as vegan or low-spice options, ensure all future suggestions align with that preference unless stated otherwise.
Health Considerations:

If the user has mentioned food sensitivities, allergies, or health conditions (e.g., lactose intolerance, diabetes), prioritize healthier alternatives and avoid suggesting potentially harmful dishes.`,
      });
      const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      };

      const parts = [
        {
          text: "input: What are some of the hidden gems in Chennai for food lovers?",
        },
        {
          text: "output: While places like Saravana Bhavan are well-known, hidden gems like Anbu Mess, Seena Bhai Tiffin Centre, and small thallu vandi biryani stalls offer affordable yet delicious food experiences that many locals swear by. Exploring these spots offers a more authentic taste of Chennai.",
        },
        {
          text: "input: Is the quality of street food in Chennai declining?",
        },
        {
          text: "output: Many locals feel that the quality of street food has declined over the years. Dishes like pani puri and biryani, which once had authentic flavors, now taste bland in many places. Overhyped eateries tend to raise prices, making it hard to justify the cost for the quality offered.",
        },
        {
          text: "input: Where can I find affordable yet tasty rolls in Chennai?",
        },
        {
          text: "output: While many popular roll centers have started to increase their prices, you can still find affordable and delicious options at small local joints, especially around T. Nagar and Egmore. Look out for places that haven’t been hyped by food vloggers to avoid paying extra.",
        },
        {
          text: "input: What can I do if I feel that food delivery services are unreliable?",
        },
        {
          text: "output: Many users have had negative experiences with food delivery apps. A safer alternative is to order from trusted local restaurants directly or try cooking at home. If you want more control over your food, experimenting with home cooking can be both satisfying and cost-effective.",
        },
        {
          text: "input: Where can I find the best biryani in Chennai?",
        },
        {
          text: "output: Besides popular spots like Ya Mohaideen, Sukkubhai, and Thalappakatti, biryani lovers recommend trying less mainstream places like Aasife Biryani and small biryani stalls in areas like Saidapet. These places often serve more authentic flavors at reasonable prices.",
        },
        {
          text: "input: What should I avoid eating when visiting Chennai?",
        },
        {
          text: "output: If you're not accustomed to the local water, it's best to avoid street food that uses raw ingredients like ice or unfiltered water. Stick to bottled water and fresh, hot food from reliable vendors to avoid potential stomach issues.",
        },
        {
          text: "input: Are food prices in Chennai's popular street food centers rising?",
        },
        {
          text: "output: Many locals have noticed an increase in prices at street food centers, especially after these places gain popularity through social media and food vloggers. While the quality may still be good, the increased prices often make it hard to justify.",
        },
        {
          text: "input: Is it better to cook food at home instead of buying street food in Chennai?",
        },
        {
          text: "output: Cooking at home has become a preferred option for many, as it allows you to control the quality and quantity of the food. While street food has its charm, home-cooked meals can offer a more wholesome and cost-effective alternative, especially with the rising prices of street food.",
        },
        {
          text: "input: Which is the best time to visit popular street food stalls in Chennai?",
        },
        {
          text: "output: To avoid crowds and inflated prices, it's best to visit popular street food stalls during off-peak hours, like early evenings on weekdays. Places like Sowcarpet or Marina Beach can get crowded, so planning your visit can lead to a better experience.",
        },
        {
          text: "input: Where can I find authentic North Indian street food in Chennai?",
        },
        {
          text: "output: For authentic North Indian street food, Sowcarpet is the go-to place in Chennai. You can find pani puri, samosas, and pav bhaji stalls serving delicious street food, though prices may vary depending on the hype and crowd.",
        },
        {
          text: "input: Is it still possible to find good old street food in Chennai despite the rising prices?",
        },
        {
          text: "output: Despite the rising prices, you can still find good old street food if you explore local, less crowded spots. Areas like Anna Nagar and Mylapore have hidden gems that offer authentic street food without the inflated prices brought on by social media fame.",
        },
        {
          text: "input: What are some must-try local dishes in Chennai?",
        },
        {
          text: "output: Must-try dishes include filter coffee, idli-sambar, masala dosa, and Chettinad chicken. Don't miss the chance to try local snacks like sundal at Marina Beach and atho from Burmese vendors in Parry’s Corner.",
        },
        {
          text: "input: Where can I get authentic Chettinad food in Chennai?",
        },
        {
          text: "output: For authentic Chettinad food, head to places like Ponnusamy Hotel and Anjappar in Chennai. These restaurants specialize in spicy, flavorful dishes like Chettinad chicken and mutton biryani.",
        },
        {
          text: "input: Are there any good vegetarian street food spots in Chennai?",
        },
        {
          text: "output: Yes, Sowcarpet is a hub for vegetarian street food, offering dishes like pani puri, kachori, and pav bhaji. You can also explore local tiffin centers across T. Nagar for dosas and vadas.",
        },
        {
          text: "input: What are some hidden food spots around T. Nagar?",
        },
        {
          text: "output: Hidden gems around T. Nagar include Jannal Kadai for traditional South Indian snacks and Murugan Idli Shop for delicious idlis and vadas. These spots offer authentic food at affordable prices.",
        },
        {
          text: "input: Is it safe to eat street food in Chennai?",
        },
        {
          text: "output: Street food in Chennai can be safe if you choose vendors who maintain cleanliness and serve freshly prepared food. Avoid raw ingredients like ice or salads, and stick to hot, cooked dishes.",
        },
        {
          text: "input: Where can I get the best dosa in Chennai?",
        },
        {
          text: "output: For the best dosas, head to places like Murugan Idli Shop, Ratna Cafe, or Balaji Bhavan. These eateries are known for their crispy dosas and delicious chutneys.",
        },
        {
          text: "input: Are there good North Indian restaurants in Chennai?",
        },
        {
          text: "output: Yes, for North Indian cuisine, check out Copper Chimney, Punjab Grill, or Rajdhani Thali Restaurant. These spots offer a variety of North Indian dishes, including paneer tikka and dal makhani.",
        },
        {
          text: "input: What are some affordable places to eat near Marina Beach?",
        },
        {
          text: "output: Near Marina Beach, you can find affordable street food stalls selling sundal, bajji, and molaga bhajji. For sit-down meals, check out Ratna Cafe for reasonably priced South Indian food.",
        },
        {
          text: "input: How is the seafood in Chennai?",
        },
        {
          text: "output: Chennai is known for its fresh seafood. Head to places like Marina Beach or coastal restaurants like Fisherman’s Fare and Bayview at Vivanta for authentic seafood dishes like fish curry and prawn masala.",
        },
        {
          text: "input: What’s the best time to visit food stalls in Sowcarpet?",
        },
        {
          text: "output: The best time to visit food stalls in Sowcarpet is in the evenings, around 5-7 PM. That’s when you can enjoy a wide variety of snacks like samosas, pav bhaji, and pani puri, freshly made and served hot.",
        },
        {
          text: "input: Where can I find the best filter coffee in Chennai?",
        },
        {
          text: "output: For authentic filter coffee, check out iconic spots like Madras Coffee House, Saravana Bhavan, or Sangeetha. These places serve strong, aromatic coffee that’s loved by locals.",
        },
        {
          text: "input: Are there any 24-hour food places in Chennai?",
        },
        {
          text: "output: For late-night food options, head to Buhari, which is open 24/7 and serves biryani, parotta, and other South Indian delicacies. Some smaller eateries around Nungambakkam also stay open late.",
        },
        {
          text: "input: Where can I get the best street biryani in Chennai?",
        },
        {
          text: "output: For street biryani, try the biryani stalls in areas like Triplicane and Pallavaram. Anbu Biryani and Aasife Biryani are popular spots for affordable, flavorful biryani.",
        },
        {
          text: "input: How expensive are the restaurants in Chennai?",
        },
        {
          text: "output: Chennai has a wide range of options, from budget-friendly tiffin centers to high-end restaurants. Meals can range from ₹50 at local stalls to ₹1500 or more at premium restaurants in luxury hotels.",
        },
        {
          text: "input: Can I find authentic international cuisine in Chennai?",
        },
        {
          text: "output: Yes, Chennai offers a variety of international cuisines, including Italian at Tuscana Pizzeria, Japanese at Aki Bay, and Middle Eastern at Zaitoon. Many upscale hotels also serve global cuisines.",
        },
        {
          text: "input: Where can I get affordable South Indian thali in Chennai?",
        },
        {
          text: "output: For affordable South Indian thali, visit Saravana Bhavan, Sangeetha, or Mathura. These places offer full meals with rice, sambar, rasam, and various curries at reasonable prices.",
        },
        {
          text: "input: What’s the best place for vegetarian food in Chennai?",
        },
        {
          text: "output: For the best vegetarian food, head to Sangeetha or Saravana Bhavan. Both restaurants are well-known for their extensive vegetarian menus, featuring dosas, idlis, and thalis.",
        },
        {
          text: "input: Are there any organic food restaurants in Chennai?",
        },
        {
          text: "output: Yes, places like Wild Garden Café at Amethyst and Ashvita Bistro offer organic, farm-to-table meals. These spots focus on healthy, organic ingredients and offer a unique dining experience.",
        },
        {
          text: "input: Where can I try authentic Chennai-style filter coffee?",
        },
        {
          text: "output: For an authentic Chennai filter coffee experience, visit Madras Coffee House, Saravana Bhavan, or Leo Coffee. These places serve strong, frothy filter coffee in the traditional Chennai style.",
        },
        {
          text: "input: Where can I get the best parottas in Chennai?",
        },
        {
          text: "output: The best parottas in Chennai can be found at Buhari, Dindigul Thalappakatti, and small eateries in Royapettah. They are often served with spicy kurma or chicken gravy.",
        },
        {
          text: "input: Are there any must-visit dessert places in Chennai?",
        },
        {
          text: "output: For desserts, visit Adyar Ananda Bhavan for traditional Indian sweets, or Cream Stone for innovative ice cream sundaes. Other must-try spots include Amadora for artisanal ice creams.",
        },
        {
          text: "input: Where can I get a good breakfast in Chennai?",
        },
        {
          text: "output: For a hearty breakfast, try Murugan Idli Shop or Ratna Cafe for classic South Indian dishes like idlis, dosas, and pongal. These places serve fresh, hot breakfasts that are loved by locals.",
        },
        {
          text: "input: What are some healthy eating options in Chennai?",
        },
        {
          text: "output: For healthy eating, check out restaurants like Soul Garden Bistro, Terra, and The Farm. These places offer fresh, organic, and vegan-friendly menus for health-conscious diners.",
        },
        {
          text: "input: Where can I find good non-veg street food in Chennai?",
        },
        {
          text: "output: For non-veg street food, try the thallu vandi stalls around Royapettah, Egmore, and Triplicane. They serve dishes like mutton chukka, chicken fry, and fish curry at affordable prices.",
        },
        {
          text: "input: How do I avoid overhyped food spots in Chennai?",
        },
        {
          text: "output: To avoid overhyped spots, ask locals for recommendations and stick to smaller, lesser-known eateries. Visiting during off-peak hours can also help you avoid crowds and inflated prices.",
        },
        {
          text: "input: What’s the best place for biryani in Chennai?",
        },
        {
          text: "output: The best places for biryani in Chennai include Ya Mohaideen Biryani, Aasife Biryani, and Dindigul Thalappakatti. Each offers a unique take on the famous South Indian biryani.",
        },
        {
          text: "input: Are there any food festivals in Chennai?",
        },
        {
          text: "output: Yes, Chennai hosts several food festivals throughout the year, including the Chennai Street Food Festival and the Great Indian Food Festival. These events showcase local and international cuisine.",
        },
        {
          text: "input: What is Chennai’s most iconic dish?",
        },
        {
          text: "output: Chennai's most iconic dish is the idli-sambar, often served with coconut chutney. This simple yet flavorful dish is a staple breakfast for many in the city.",
        },
        {
          text: "input: Where can I try traditional Chettinad cuisine in Chennai?",
        },
        {
          text: "output: For traditional Chettinad cuisine, visit places like Anjappar, Ponnusamy, and Velu Military Hotel. These spots serve spicy, flavorful Chettinad dishes like chicken curry and pepper mutton.",
        },
      ];

      // console.log(chatHistory)
      const combined = [{ role: "user", parts: parts }];
      await chatHistory.forEach((element) => {
        combined.push({
          role: element.role,
          parts: [{ text: element.text }],
        });
      });
      // console.log(combined);
      const session = model.startChat({
        generationConfig,
        history: combined,
      });

      const result = await session.sendMessage(message);

      const responseText = result.response.text();
      // console.log(responseText);
      res.status(200).json({ response: responseText });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Error sending message" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
