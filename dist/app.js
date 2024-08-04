"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ollama_1 = require("@langchain/community/llms/ollama");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const model = new ollama_1.Ollama({
    baseUrl: "http://localhost:11434",
    model: "llama3.1",
    temperature: 0.5,
});
const schema = '{{ people: [{{ name: "string", height_in_meters: "number" }}] }}';
const formatInstructions = `
  Respond only in valid JSON. The JSON object you return should match the following schema:
  ${schema}
  Where people is an array of objects, each with a name and height_in_meters field.
  Do not describe the result of each field in your response.
`;
const parser = new output_parsers_1.JsonOutputParser();
const prompt = prompts_1.ChatPromptTemplate.fromMessages([
    [
        "system",
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
function MyPrompt() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const chain = prompt.pipe(model);
            const result = yield chain.invoke({ query });
            console.log(result);
            console.log("Parsing the output...");
            const afterparse = yield parser.invoke(result);
            console.log(afterparse);
        }
        catch (error) {
            console.error("An error occurred during the chat...");
            console.error(error);
        }
    });
}
MyPrompt().then(() => {
    console.log("\n--- Chat completed. ---");
});
