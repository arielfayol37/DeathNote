import ollama
import os, uuid

def parse_entry(text, name="Fayol"):
    system_prompt = {"role":"system",
                     "content":f"""I write notes about anything and everything, including my own thoughts (in fact mostly). I can upload images to my notes and record voice notes. The images and audio parts of the note have been parsed into text for you. They are embedded within tags. <image description start> and <image description end> for images. <audio transcription start> and <audio transcription end> for voice recordings. Now I want two things from you. You will serve as a tool for my notes app by providing a title for the note and a summary. Read the and provide a descriptive title encompassing the entire content and striking details, and a detailed summary. You should enclose title within title tags and the summary within summary tags. Just like html tags. e.g. <title> Some title </title> an
... d <summary> some text summary </summary>. Your summary should be written like you are talking to a third-party about my note, but the title is for my notes app, so you don't need to include my name it. My name is {name}. Here is the note:"""}
    messages = [system_prompt] + [{"role": "user", "content": '""""' + text + '""""'}]
    # response = ollama.chat(model="llama3", messages=messages)
    # response = ollama.chat(model="dolphin-llama3:8b-256k", messages=messages)
    response = ollama.chat(model="tarruda/neuraldaredevil-8b-abliterated:fp16", messages=messages)
    content = response["message"]["content"]
    # print(text, "\n\n", content)
    title = content.split("<title>")[1].split("</title>")[0]
    summary = content.split("<summary>")[1].split("</summary>")[0]
    return title, summary

def get_title(message):
    system_prompt = {"role":"system", "content":"The following is an entry from a diary. Generate a short title that captures the important and intriguing details for it. Your output should strictly be the title. No comments."}
    messages = [system_prompt] + [{"role": "user", "content": message}]
    response = ollama.chat(model="tarruda/neuraldaredevil-8b-abliterated:fp16", messages=messages)
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
  content = response["message"]["content"]
  return content

def transcribe_audio(model, audio_path):
   transcription = model.transcribe(audio_path)
   return transcription["text"]

def handle_uploaded_file(uploaded_file, upload_dir='temp_uploads'):
    """
    Saves an UploadedFile to a local directory (temp_uploads by default).
    Returns the absolute path to the saved file.
    """
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    # Generate a random file name with the correct extension
    extension = os.path.splitext(uploaded_file.name)[1]  # e.g. ".jpg", ".m4a"
    filename = f"{uuid.uuid4()}{extension}"
    filepath = os.path.join(upload_dir, filename)

    # Write chunks from the UploadedFile into the new file
    with open(filepath, 'wb+') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)
    return filepath