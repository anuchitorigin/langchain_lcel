import { Ollama } from "@langchain/community/llms/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";

const model = new Ollama({
  baseUrl: "http://localhost:11434", // Default value
  model: "llama3.1",
  temperature: 0.5,
});

// ### 1. LCEL ###
// async function MyStream() {
//   const stream = await model.stream(
//     `Translate "I love programming" into German.`
//   );

//   for await (const chunk of stream) {
//     process.stdout.write(chunk)
//   }
// }

// MyStream().then(() => {
//   console.log('\n--- Chat completed. ---')
// });

// async function MyInvoke() {
//   const messages = [
//     new SystemMessage("Translate the following from English into Italian"),
//     new HumanMessage("hi!"),
//   ];
// const parser = new StringOutputParser();
//   const result = await model.invoke(messages);
//   const output = await parser.invoke(result); // output is the same as the result
//   console.log(output);
// }

// MyInvoke().then(() => {
//   console.log("\n--- Chat completed. ---");
// });

// ### 2. Prompt Templates ###
// const parser = new StringOutputParser();
// const systemTemplate = "Translate the following into {language}:";
// const promptTemplate = ChatPromptTemplate.fromMessages([
//   ["system", systemTemplate],
//   ["user", "{text}"],
// ]);

// async function MyPrompt() {
//   // const result = await promptTemplate.invoke({ language: "italian", text: "hi" });
//   const chain = promptTemplate.pipe(model).pipe(parser);
//   const result = await chain.invoke({ 
//     language: "italian", 
//     text: "hi" 
//   });
//   console.log(result);
// }

// MyPrompt().then(() => {
//   console.log("\n--- Chat completed. ---");
// });

// ### 3. Structured Output ###
type Person = {
  name: string;
  height_in_meters: number;
};

type People = {
  people: Person[];
};

const schema = '{{ people: [{{ name: "string", height_in_meters: "number" }}] }}';

const formatInstructions = `
  Respond only in valid JSON. The JSON object you return should match the following schema:
  ${schema}
  Where people is an array of objects, each with a name and height_in_meters field.
  Do not describe the result of each field in your response.
`;

// Set up a parser
const parser = new JsonOutputParser<People>();

// Prompt
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    // `Answer the user query. Wrap the output in 'json' tags\n${formatInstructions}`,
    `Answer the user query. ${formatInstructions}`,
  ],
  [
    "human", 
    "{query}"
  ],
]);

const query = `
  Anna is 23 years old and she is 6 feet tall
  John is 30 years old and he is 5 feet 10 inches tall
`;

// console.log((prompt.format({ query })).toString());

async function MyPrompt() {
  try {
    // const chain = prompt.pipe(model).pipe(parser);
    // const result = await chain.invoke({query});
    const chain = prompt.pipe(model);
    const result = await chain.invoke({query});
    console.log(result);
    console.log("Parsing the output...");
    const afterparse = await parser.invoke(result);
    console.log(afterparse);
  } catch (error) {
    console.error("An error occurred during the chat...");
    console.error(error);
  }
}

MyPrompt().then(() => {
  console.log("\n--- Chat completed. ---");
});