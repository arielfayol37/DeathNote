import ollama
ollama_model = "tarruda/neuraldaredevil-8b-abliterated:fp16"
def generate(messages):
    response = ollama.chat(model=ollama_model, messages=messages)
    content = response["message"]["content"]
    return content

system_prompt = {"role":"system", "content":"The following is an entry from a diary. Generate a short title that captures the important and intriguing details for it. Your output should strictly be the title. No comments."}

message = "I spent all my day coding and having sex with this bitch. I hope I don't get sick"
messages = [{"role": "user", "content": message}]

print(generate([system_prompt] + messages))

def get_embedding(message):
  response = ollama.embed(model="mxbai-embed-large", input=message)
  embeddings = response["embeddings"]
  return embeddings

