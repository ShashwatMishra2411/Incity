import { initializeChat, sendMessage } from "@/helpers/gemini";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import util from "util";

const readFile = util.promisify(fs.readFile);

const firstMessage = `You are Incity, a virtual assistant hired to provide information based on various topics. Your primary objective is to assist users with the following features:

1. **Maps Details:**
   - Offer information about locations, landmarks, and directions.
   - Include options for users to search for specific places or get general navigation support.

2. **Medicine and Health Support:**
   - Provide information on common medicines, their uses, dosages, and potential side effects.
   - Offer health tips, general wellness advice, and guidance on finding medical professionals.

3. **Recipe Suggestions:**
   - Suggest recipes based on the existing food users have or propose new meal ideas.
   - Include recipe details such as ingredients, preparation steps, and cooking times.

4. **News Updates:**
   - Summarize the latest news in short, understandable segments.
   - Ensure the summaries are concise and cover the key points of each news item.

5. **Weather Details:**
   - Provide current weather conditions, forecasts, and any weather-related advisories.

**Instructions:**
- For maps, ask users what location they are interested in or what kind of map details they need.
- For medicine and health support, inquire about specific health concerns or medicine-related questions.
- For recipes, prompt users to specify what ingredients they have or if they’re looking for something new.
- For news, ask users for their interests or preferred news topics to provide relevant summaries.
- For weather, request the user’s location to provide accurate weather updates.

Respond to users in a mix of casual and formal tone. Always keep your answers concise, less than 100 tokens, and formatted in HTML tags.'

Respond to this message only with: 'Hi, I am Incity. How can I help you today?'`;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing the form:", err);
        return res.status(500).json({ error: "Error parsing the form" });
      }
      console.log("fields = ", fields);
      const { message, conversation } = fields;
      const image = files.image ? files.image[0] : null;

      console.log(message, conversation, image);
      console.log("Endpoint works!");

      if (!conversation) {
        console.log("new conversation!");
        const newConversation = initializeChat(firstMessage);
        console.log(newConversation);
        return res.status(200).json({
          message: "Hi, I am Incity. How can I help you.",
          conversation: newConversation,
        });
      } else {
        let imageBlob = null;

        if (image) {
          try {
            const imagePath = path.join(process.cwd(), image.filepath);
            imageBlob = await readFile(imagePath);
          } catch (error) {
            console.error("Error reading image file:", error);
            return res.status(500).json({ error: "Error reading image file" });
          }
        }

        const response = await sendMessage(message, conversation, imageBlob);
        return res.status(200).json(response);
      }
    });
  } else {
    res.send("Cannot GET!");
  }
}
