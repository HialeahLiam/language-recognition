FROM public.ecr.aws/lambda/python:3.10

COPY audio_transcription.py requirements.txt ./

RUN pip install -r requirements.txt

# Command can be overwritten by providing a different command in the template directly.
CMD ["audio_transcription.lambda_handler"]
