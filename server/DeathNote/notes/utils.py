import ollama

def get_title(message):
    system_prompt = {"role":"system", "content":"The following is an entry from a diary. Generate a short title that captures the important and intriguing details for it. Your output should strictly be the title. No comments."}
    messages = [system_prompt] + [{"role": "user", "content": message}]
    response = ollama.chat(model="tarruda/neuraldaredevil-8b-abliterated:fp16", 
                           messages=messages)
    return response["message"]["content"]

def get_embedding(message):
  response = ollama.embed(model="mxbai-embed-large", input=message)
  return response["embeddings"][0]


def describe_image(image_path):
  response = ollama.chat(
      model='llama3.2-vision',
      messages=[{
          'role': 'user',
          'content': 'Given the following, provide all the description you can as well as the info in the image such that the image can be reproduced if need be. This is for extremely important purposes, so do not ommit any information and keep your answer long',
          'images': [image_path]
      }]
  )
  return response["message"]["content"]

def transcribe_audio(model, audio_path):
   transcription = model.transcribe(audio_path)
   return transcription["text"]
