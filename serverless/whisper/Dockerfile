FROM public.ecr.aws/lambda/python:3.10

COPY whisper.py requirements.txt ./

RUN pip install -r requirements.txt

# Command can be overwritten by providing a different command in the template directly.
CMD ["whisper.lambda_handler"]
