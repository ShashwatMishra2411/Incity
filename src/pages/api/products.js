import { GoogleGenerativeAI } from "@google/generative-ai";

const handler = async (req, res) => {
  if (req.method === "POST") {
    try {
      // console.log(req);
      // console.log(req.body);
      const { prompt, imageParts } = req.body;
      // console.log(prompt, imageParts);
      const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(API_KEY);
      const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      };
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction:
          "Objective: Analyze images of rooms to identify empty spaces and recommend suitable products that enhance the environment.Instructions:1. **Analyze the Image**: Examine the provided image for empty or under-utilized spaces, such as corners, walls, or areas lacking decor.2. **Environment Assessment**:  - Consider the style, color scheme, and overall ambiance of the room.   - Identify the primary function of the space (e.g., bedroom, living room, office) to ensure product recommendations are contextually appropriate.3. **Product Recommendations**:  - Suggest products that complement the existing decor and fill the identified empty spaces.  - Each recommendation should include:- 'name': The name of the product.- 'imageLink': A link to an image of the product.- 'ProductLink': A link to purchase the product.- 'Description': A brief description of the product.- 'HowItwouldBenefitTheSpaceProvidedIntheImage': An explanation of how the product enhances the room.- 'shopName': The name of the local shop where the product is available.- 'shopAddress': The address of the shop.- 'price': The cost of the product.4. **Local Market Focus**: Ensure that the recommended products are available in local shops around Chennai. Include shop names and addresses to facilitate user access to the products.5. **Output Format**: Provide the recommendations as a raw JSON array without any additional text or formatting. The JSON should have the structure outlined above.6. **Safety and Relevance**: Ensure that all recommendations are safe, culturally appropriate, and relevant to the target audience in Chennai.By following these instructions, you will help users effectively enhance their spaces with locally available products tailored to their needs. ",
      });
      const parts = [
        { text: "Suggest me some products for this kitchen in Chennai" },
        { text: "Image: " },
        // {
        //   inlineData: {
        //     data: "base64encodedstring2",
        //     mimeType: "image/jpeg",
        //   },
        // },
        {
          text: '[{ "name": "Granite Countertop Spice Rack","imageLink": "https://example.com/granite-spice-rack.jpg","ProductLink": "https://example.com/granite-spice-rack","Description": "A sturdy, natural granite spice rack with multiple compartments.","HowItwouldBenefitTheSpaceProvidedIntheImage": "Keeps spices organized and adds a modern yet natural aesthetic to your kitchen c",{"name": "Traditional Copper Water Jug","imageLink": "https://example.com/copper-water-jug.jpg","ProductLink": "https://example.com/copper-water-jug","Description": "Handcrafted copper jug for storing and serving water.","HowItwouldBenefitTheSpaceProvidedIntheImage": "Brings traditional charm to the kitchen while offering health benefits associated with copper.","shopName": "Heritage Copperware","shopAddress": "58 Bazaar Road, Chennai, Tamil Nadu","price": "₹950"},{"name": "Ceramic Kitchen Storage Jars","imageLink": "https://example.com/ceramic-jars.jpg","ProductLink": "https://example.com/ceramic-jars","Description": "Set of 3 handcrafted ceramic storage jars with airtight lids.","HowItwouldBenefitTheSpaceProvidedIntheImage": "Provides stylish and practical storage for dry ingredients while enhancing the kitchen’s rustic look.","shopName": "Chennai Pottery House","shopAddress": "12 Potters Lane, Chennai, Tamil Nadu","price": "₹1,800"},{"name": "Brass Mortar and Pestle Set","imageLink": "https://example.com/brass-mortar-pestle.jpg","ProductLink": "https://example.com/brass-mortar-pestle","Description": "Handcrafted brass mortar and pestle set for grinding spices.","HowItwouldBenefitTheSpaceProvidedIntheImage": "Adds a traditional touch and practical functionality to the kitchen for fresh spice grinding.","shopName": "Heritage Kitchen Tools","shopAddress": "7 Spice Lane, Chennai, Tamil Nadu","price": "₹700"},{"name": "Wall-Mounted Wooden Utensil Rack","imageLink": "https://example.com/wooden-utensil-rack.jpg","ProductLink": "https://example.com/wooden-utensil-rack","Description": "A beautifully crafted wall-mounted rack for kitchen utensils.","HowItwouldBenefitTheSpaceProvidedIntheImage": "Keeps kitchen utensils neatly organized while adding a rustic, handcrafted element to the space.","shopName": "Wooden Craftworks","shopAddress": "24 Artisan Street, Chennai, Tamil Nadu","price": "₹1,500"}]',
        },
        { text: prompt },
        { text: "Image: " },
        imageParts,
      ];
      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
      });
      // console.log(result.response.text());
      const parsedResponse = JSON.parse(result.response.text());
      // console.log(parsedResponse);
      res.status(200).json(parsedResponse);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;

// [
//   { text: "Suggest me some products for this room" },
//   { text: "Image:" },
//   {
//     inlineData: {
//       data: "base64encodedstring",
//       mimeType: "image/jpeg",
//     },
//   },
//   {
//     text: "[{ name: 'Product Name', imageLink: 'https://example.com/image.jpg', ProductLink: 'https://example.com/product', Description: 'Product Description', HowItwouldBenefitTheSpaceProvidedIntheImage: 'Explanation' }]",
//   },
// ];
