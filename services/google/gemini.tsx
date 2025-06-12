const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateContent = async () => {

    const prompt = "Explain how AI works";

    const result = await model.generateContent(prompt);
    console.log(result.response.text());
};

export const generateEventDescription = async (data : any) => {

    const prompt = 
    `Write a captivating, engaging, and persuasive event description for "${data.event_title}". 
    It is a **${data.event_type}** event with MyCSD Core value of**${data.mycsd_core}** taking place on **${data.event_date}** at **${data.event_location}**, organized by **${data.event_organizer}**. It is a **${data.event_level}** event with **${data.max_participants}** participants.

    Your description should include:
    - **An attention-grabbing introduction** that excites students about the event.
    - **What makes this event special and unique**—highlight key aspects that set it apart.
    - **Compelling reasons why students should attend**, focusing on the value and benefits.
    - **The major highlights** (e.g., speakers, activities, workshops, networking opportunities).
    - **A strong call to action** that motivates students to sign up or participate.

    Write in a way that appeals to university students, using an enthusiastic, friendly, and inviting tone. 
    Ensure the description is clear, engaging, and easy to read.`;

    const result = await model.generateContent(prompt);
    //console.log(result.response.text());
    return result.response.text();
};

export const generateEventSummary = async (data : string) => {

    const prompt = 
    `Summarize the following event details in **2-3 sentences**, making it clear, engaging, and informative. 

    Event Details:  
    "${data}"

    Your summary should:  
    - Be **brief yet informative**.  
    - Highlight the **main purpose and key details** of the event.  
    - Use an **engaging and inviting tone** to attract students.  

    Write in a way that excites students and encourages participation.`;

    const result = await model.generateContent(prompt);
    //console.log(result.response.text());
    return result.response.text();
};

export const generateAnalyticsReport = async (data : any) => {

    const prompt = `
            Analyze the following event data and generate an insightful summary:
            - Total Registrations: ${data.totalRegistrations}
            - Total Attendance: ${data.totalAttendance}
            - Attendance Rate: ${data.attendanceRate}%
            - Registrations Over Time: ${JSON.stringify(data.registrationsOverTime)}
            - Participants by Year: ${JSON.stringify(data.participantsByYear)}
            - Participants by Programme: ${JSON.stringify(data.participantsByProgramme)}
            
            Provide a summary highlighting key insights and trends.
        `;

    const result = await model.generateContent(prompt);
    //console.log(result.response.text());
    return result.response.text();
}

export const generateChatbotReply = async (data : string) => {
    
    const prompt = `
        You are a helpful assistant for the MyCSD Event Hub at Universiti Sains Malaysia (USM).
        
        Context about MyCSD Event Hub:
        - MyCSD stands for "My Co-curricular, Sports and Development" program at USM
        - Students earn MyCSD points by attending events across different cores/categories
        - The MyCSD cores are: Reka Cipta & Inovasi, Khidmat Masyrakat, Pengucapan Awam, Kesukarelawanan, Keusahawanan, Kepimpinan, Kebudayaan, and Sukan
        - Events have different levels: University/School level (2 points), State level (4 points), and International level (8 points)
        - Students can register for events, attend them, and track their MyCSD points
        - Organizations can create and manage events
        
        Answer the following question in a clear, concise and helpful manner:
        Student asks:"${data}"
        
        If the question is about:
        - Event registration: Explain how to register for events through the platform
        - MyCSD points: Explain how points are calculated based on event levels
        - Event creation: Explain that only organizations can create events
        - Attendance: Explain that attendance is verified using a password provided at the event
        
        Keep your response friendly, informative, and under 150 words when possible. If you don't know the answer, suggest contacting the MyCSD administrator.
        Avoid using technical jargon and ensure the language is accessible to all students.
        Use a friendly and approachable tone, as if you are a fellow student helping out.
        Be concise and to the point, while still providing enough information to be helpful.
        If the question is not related to MyCSD, politely inform the student that you can only assist with MyCSD-related inquiries.
        If the question is too vague, ask for more specific details to provide a better answer.
        Keep your answer as short as possible while still being informative.
    `;

    const result = await model.generateContent(prompt);
    //console.log(result.response.text());
    return result.response.text();
}