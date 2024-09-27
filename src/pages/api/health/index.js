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
The user's name is Shashwat Mishra, and he is 20 years old. Use his age, medical history, lifestyle habits, and other personal factors to provide tailored, accurate, and empathetic responses. Ensure that any health recommendations are appropriate for his age group, align with his known medical conditions, and consider any relevant symptoms or queries he may have. Prioritize personalized advice, including preventive care, possible risks, and lifestyle adjustments. The response should be clear, actionable, and considerate of Shashwat's unique needs.`,
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
          text: "input: I was bitten by a stray dog in North Chennai. What should I do?",
        },
        {
          text: "output: Go to the nearest government or private hospital immediately for a rabies vaccination. Chennai hospitals like Rajiv Gandhi Government General Hospital and Apollo Hospital provide post-exposure rabies vaccines. Don’t delay, as rabies is fatal once symptoms appear.",
        },
        {
          text: "input: I'm experiencing respiratory issues, and I live near Perungudi in Chennai. Could it be due to pollution?",
        },
        {
          text: "output: Perungudi, like other industrial areas in Chennai, has seen rising air pollution levels. Prolonged exposure can trigger respiratory issues like asthma or bronchitis. It’s advisable to wear a mask outdoors and consult a doctor if the symptoms persist.",
        },
        {
          text: "input: Is it safe to drink tap water in Chennai during the monsoon season?",
        },
        {
          text: "output: During the monsoon, tap water in Chennai can be contaminated due to flooding and pipeline issues. It is safer to drink boiled or bottled water to avoid waterborne diseases like cholera or diarrhea.",
        },
        {
          text: "input: I'm concerned about dengue fever in Chennai. What are the symptoms?",
        },
        {
          text: "output: Dengue fever is common in Chennai during the rainy season. Look out for symptoms like high fever, severe headache, pain behind the eyes, joint pain, and rashes. If you suspect dengue, visit a healthcare provider for a blood test.",
        },
        {
          text: "input: I'm visiting Chennai in May and I’m worried about heatstroke. What precautions should I take?",
        },
        {
          text: "output: May is one of the hottest months in Chennai. To avoid heatstroke, stay hydrated, avoid going out during peak afternoon hours, wear light clothing, and stay in shaded or air-conditioned areas as much as possible.",
        },
        {
          text: "input: I live in T. Nagar and have been hearing about cases of chikungunya. What should I be aware of?",
        },
        {
          text: "output: Chikungunya cases often rise in Chennai during the monsoon due to stagnant water where mosquitoes breed. Symptoms include fever, joint pain, and rashes. Make sure to use mosquito repellents and keep your surroundings clean.",
        },
        {
          text: "input: I have food poisoning after eating at a street stall in Chennai. What should I do?",
        },
        {
          text: "output: Street food in Chennai can sometimes cause foodborne illnesses. Stay hydrated, avoid solid food for a while, and drink oral rehydration solutions (ORS) to recover. If symptoms worsen or last more than two days, see a doctor.",
        },
        {
          text: "input: I want to know which hospital in Chennai is best for childbirth and what the costs are.",
        },
        {
          text: "output: Many recommend Apollo Hospital, Cloudnine, and SRM Hospital for childbirth in Chennai. Costs vary widely depending on the services, with normal deliveries ranging from ₹40,000 to ₹1.5 lakhs, while C-sections can go up to ₹2.5 lakhs or more. It’s advisable to inquire directly with the hospital for a detailed breakdown, as many hospitals do not publish their rates.",
        },
        {
          text: "input: Looking for good multi-speciality hospitals in Chennai with decent pricing for frequent health checkups.",
        },
        {
          text: "output: SIMS Hospital, Vijaya Hospital, and Billroth Hospitals are known for providing comprehensive care at reasonable rates. They treat patients humanely and have decent consultation fees ranging from ₹300 to ₹600, while common tests like blood work might cost ₹500-₹1000 depending on the complexity.",
        },
        {
          text: "input: I want to get a dental implant for my father in Chennai. Price is not an issue, but we need the best service.",
        },
        {
          text: "output: For high-quality dental implants in Chennai, consider Dr. Smilez or Apollo White Dental. These hospitals are known for their professionalism and advanced technology. While costs can be high, ranging from ₹25,000 to ₹50,000 per implant depending on the complexity, the service quality and aftercare are top-notch.",
        },
        {
          text: "input: I'm dealing with severe social anxiety and body image issues, but making progress thanks to therapy at Kilpauk Hospital.",
        },
        {
          text: "output: Kilpauk Mental Health Hospital is highly recommended for mental health treatment in Chennai. Many patients report significant improvements through cognitive behavioral therapy (CBT) and exposure therapy. Consistent medication and professional counseling have been key factors in addressing issues like social anxiety, body image concerns, and loneliness.",
        },
        {
          text: "input: Need recommendations for CGHS hospitals in Chennai with critical care facilities. My mother is in ICU, and the current hospital doesn't accept CGHS.",
        },
        {
          text: "output: Some recommended CGHS-affiliated hospitals with critical care facilities in Chennai include MGM Healthcare and Fortis Malar Hospital. They are recognized for their critical care units and accepting CGHS patients, which could ease the financial burden significantly. ICU costs can still be around ₹50,000 to ₹80,000 per day in private hospitals.",
        },
        {
          text: "input: I need advice on addressing a grievance with a private hospital in Old Perungalathur. My friend had an appointment with the gynecologist, who also owns the hospital. After multiple delays and waiting for over four hours on the day of the appointment, my friend finally saw the doctor, who was dismissive and rude. She didn’t provide any explanations about the health reports. When my friend expressed dissatisfaction, she was told to go elsewhere and later informed that she was not allowed to return to the hospital. The Google reviews seem to be flooded with fake five-star ratings.",
        },
        {
          text: "output: This situation seems to reflect poor management and a lack of accountability. Since the hospital owner is the doctor in question, raising the issue within the hospital might be ineffective. Instead, your friend could take the following steps:File a formal complaint with the Tamil Nadu Medical Council regarding the doctor’s behavior and negligence. Provide as much evidence as possible, including appointment details, the rude interaction, and the failure to attend the scheduled appointment.Report the fake Google reviews by flagging them and providing context through a genuine review. You could also consider posting on forums like r/Chennai for visibility and community advice.Depending on the severity, your friend can file a case with the District Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019 for deficiency in service.If the situation escalates, legal advice might be necessary. Although this is not criminal, seeking help from a lawyer specializing in medical negligence can offer guidance.While grievances in private healthcare are challenging, such steps can ensure accountability, especially if the hospital has a broader influence on the local community.",
        },
        {
          text: "input: I had an issue with a doctor at a private hospital in Chennai. The doctor was dismissive and refused to explain my reports. When I complained, they said I should not come back. How can I escalate this issue?",
        },
        {
          text: "output: In cases like this, it’s important to raise the issue through formal channels:Tamil Nadu Medical Council: You can file a formal complaint against the doctor. They will review the case and take necessary action if the doctor's behavior violates medical ethics.Consumer Protection Act: If you feel there was a deficiency in the service, you can approach the Consumer Court for resolution.Google Reviews: Leave an honest review outlining your experience to inform others. Flag any suspicious reviews you suspect to be fake.Community Forums: Posting in forums like r/Chennai or Local Citizens Groups can help raise awareness about such practices and warn others.Taking these steps can make the issue more public and hold the hospital accountable for unprofessional behavior.",
        },
        {
          text: "input: I had a terrible experience at a private hospital in Chennai. The doctor was dismissive, and after I complained, I was told not to return. The hospital also has many fake positive reviews. What can I do about this?",
        },
        {
          text: "output: If you had a bad experience at a hospital, you have several options to address it:File a complaint with the Tamil Nadu Medical Council. They handle grievances against medical professionals and will investigate the matter.Consider filing a case with the Consumer Court if you feel that the service provided was deficient.Report the fake reviews to Google, providing detailed context. Write your honest review to warn others of the hospital’s practices.Share your experience on platforms like r/Chennai to get community support and raise awareness of unethical practices.By escalating through official and public channels, you can push for some form of accountability.",
        },
        {
          text: "input: Suggest affordable dental clinics for teeth cleaning in Chennai.",
        },
        {
          text: "output: Some affordable dental clinics in Chennai for teeth cleaning include XYZ Dental Clinic in T. Nagar, with prices ranging from ₹1,500 to ₹2,500 and a rating of 4.5. Patients have praised the professional service, although there might be a longer waiting time. Another option is ABC Dental Care in Adyar, offering teeth cleaning services for ₹2,000 to ₹3,000. It’s well-regarded for routine cleanings but can be expensive for other services.",
        },
        {
          text: "input: Recommend the best clinics for braces treatment in Chennai.",
        },
        {
          text: "output: Top clinics for braces treatment in Chennai include ABC Dental Care in Adyar, known for orthodontic services like braces, with prices starting from ₹25,000. It has a rating of 4.2, and reviews indicate good quality care, though some found it a bit expensive. Another option is SmileAlign Orthodontics in Anna Nagar, which offers braces treatments ranging from ₹20,000 to ₹40,000, with positive reviews about their experienced staff and modern equipment.",
        },
        {
          text: "input: Looking for the best dental clinic in Chennai for teeth whitening under ₹5,000.",
        },
        {
          text: "output: ABC Dental Care in Adyar is a popular choice for teeth whitening in Chennai, with services starting at ₹4,000. Patients rate it 4.2 for its friendly staff and clean facilities. Another option is Bright Smiles Dental in Velachery, where teeth whitening costs between ₹3,500 and ₹5,000. It’s known for its affordability and quality care, making it a great option for budget-conscious patients.",
        },
        {
          text: "input: Any recommendations for a dentist in Chennai for cavity filling?",
        },
        {
          text: "output: XYZ Dental Clinic in T. Nagar offers cavity filling services, with prices ranging from ₹1,000 to ₹2,000. It’s highly rated for professional care and an affordable price range. ABC Dental Care in Adyar also provides cavity fillings at a similar price range, although some reviews mention slightly longer wait times.",
        },
        {
          text: "input: Need affordable orthodontic treatment options in Chennai.",
        },
        {
          text: "output: Affordable orthodontic treatment options in Chennai include SmileAlign Orthodontics in Anna Nagar, where braces treatments are available between ₹20,000 to ₹40,000. Reviews highlight the experienced staff and modern equipment. ABC Dental Care in Adyar also offers orthodontic services, though some patients have found their prices slightly higher, ranging from ₹25,000 upwards.",
        },
        {
          text: "input: I live in Kelambakkam, can you suggest any local clinic?",
        },
        {
          text: "output: Of course! Here are a couple of clinics near Kelambakkam that you might consider:Kelambakkam Family ClinicAddress: Old Mahabalipuram Road (OMR), Kelambakkam, Chennai - 603103Contact: +91 9876543210Known for its prompt service and experienced general practitioners.Sri Sai ClinicAddress: Kovalam Road, Kelambakkam, Chennai - 603103Contact: +91 9123456789A well-known clinic for general checkups and minor treatments, offering affordable healthcare.I recommend calling the clinics beforehand to confirm their availability and services.Would you like me to find more clinics in Kelambakkam or assist you with any other health concerns?",
        },
        {
          text: "input: I'm nee to chennsi and i'm having a medical emergency. I have cut my hand on a rusted nail. I'm at Marina Beach. What should i do?",
        },
        {
          text: "output: If you have cut your hand on a rusted nail and are at Marina Beach in Chennai, it's important to take immediate action:Stay Calm: Try to remain calm to assess the situation clearly.Clean the Wound: If possible, rinse the wound gently with clean water to remove dirt and debris. Avoid using soap directly in the wound.Apply Pressure: If the cut is bleeding, apply gentle pressure with a clean cloth or bandage to stop the bleeding.Seek Medical Attention: It’s crucial to get medical help, especially since it’s a rusted nail. Go to the nearest hospital or clinic as soon as possible.Nearby Hospitals:Government Royapettah Hospital (approximately 3 km away) Apollo Hospital (approximately 6 km away) Consider Tetanus Vaccination: Depending on your tetanus vaccination status, you may need a booster shot, especially if you haven't had one in the last 5 years.Avoid Self-Treatment: Do not attempt to remove any deep debris or treat the wound with home remedies without professional guidance.If you need assistance getting to a hospital, consider calling a local ambulance service or asking someone nearby for help. Please take care!",
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
