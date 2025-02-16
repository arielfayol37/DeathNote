import ollama
ollama_model = "tarruda/neuraldaredevil-8b-abliterated:fp16"

def get_title(message):
    system_prompt = {"role":"system", "content":"The following is an entry from a diary. Generate a short title that captures the important and intriguing details for it. Your output should strictly be the title. No comments."}
    messages = [system_prompt] + [{"role": "user", "content": message}]
    response = ollama.chat(model=ollama_model, messages=messages)
    content = response["message"]["content"]
    return content

def get_embedding(message):
  response = ollama.embed(model="mxbai-embed-large", input=message)
  embeddings = response["embeddings"]
  return embeddings[0]