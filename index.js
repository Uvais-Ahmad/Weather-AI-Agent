const OPEN_AI_KEY = process.env.Open_AI_Key;
const openai = require('openai');
const readlineSync = require('readline-sync');


const client = new openai.OpenAI({
    apiKey: Open_AI_Key,

})

function getWeatherDetail(city) {
    city = city.toLowerCase();
    if(city === "delhi") return "10°C";
    else if(city === "mumbai") return "28°C";
    else if(city === "bangalore") return "22°C";
    else if(city === "kolkata") return "30°C";
    else if(city === "vadodara") return "28°C";
    else if(city === "meerut") return "17°C";
    else if(city === "kanpur") return "21°C";
    else if(city === "shimla") return "12°C";
}

const tools = {
    "getWeatherDetail": getWeatherDetail
}

const SYSTEM_PROMPT = `
    You are an AI Assistants with START, PLAN, ACTION, OBSERVATION AND OUTPUT State. Wait for the user prompt
    first Plan based on the available tools.Take Action using appropriate tools and wait for Observation based
    on Action.
    Once you get the observation, Return AI response based on the START prompt and observation.

    Strictly follow the JSON output format as in examples
    Available Tools:
    - function getWeatherDetail(city: string) : string
    getWeatherDetail get accepts the city as a input and return the weather details based on the input.

    Example:
    START
    {"type": "user", "user": "What is the sum of weather of Delhi and Mumbai?"}
    {"type": "plan", "plan": "I will cal the getWeatherDetail for Delhi"}
    {"type": "action", "function": "getWeatherDetail", "input": "Delhi"}
    {"type": "observation", "observation": "10°C"}
    {"type": "plan", "plan": "I will cal the getWeatherDetail for Mumbai"}
    {"type": "action", "action": "I will cal the getWeatherDetail for Mumbai", "input": "Mumbai"}
    {"type": "observation", "observation": "28°C"}
    {"type": "output", "output": "The sum of weather of Delhi and Mumbai is 38°C"}
`

async function main(SYSTEM_PROMPT) {
    const messages = [
        {role: 'system', content: SYSTEM_PROMPT},
    ];

    while( true ) {
        const q = readlineSync.question('>> ');
        const query = {
            role: 'user',
            user: q
        }
        messages.push({
            role: 'user',
            content: JSON.stringify(query)
        });

        while(true) {
            let result = await chat(messages);
            messages.push({
                role: 'assistant',
                content: result
            });

            console.log("=========================== START AI ============================")
            console.log(result)
            console.log("=========================== End AI ============================")
            const call = JSON.parse(result);
            if(call.type === "output") {
                console.log(`🤖 : ${call.output}`);
                break;
            }
            else if( call.type === "action") {
                const fn = tools[call.function];
                const observation = fn(call.input);
                const obs = {"type": "observation", "observation": observation};
                messages.push({
                    role: 'developer',
                    content: JSON.stringify(obs)
                })
            }
        }
    }
}

main(SYSTEM_PROMPT);
async function chat (messages) {
    try {
        const response = await client.chat.completions
            .create({
                model: "gpt-4.1-mini",
                messages: messages,
                //  [
                //     {role: 'system', content: SYSTEM_PROMPT},
                //     {role: "user", content: userContext},
                // ],
                response_format: {type: 'json_object'}
            })
        let responseText = response.choices[0].message.content;
        return responseText;
    }
    catch (error) {
        console.error("Error fetching response from OpenAI:", error);
    }
}