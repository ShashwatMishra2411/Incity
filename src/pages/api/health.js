import { textGenerator1 } from "@/helpers/gemini";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      try {
        const { weatherData, longitude, latitude } = req.body;
        const message = await textGenerator1(
          JSON.stringify({ weatherData, longitude, latitude })
        );
        return res.status(200).json({ message: JSON.parse(message) });
      } catch (error) {
        console.log(error.message);
      }
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
