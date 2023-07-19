# Deploying Serverless functions

We use a SAM template to configure our deploy and GitHub actions to automatically deploy/update our AWS resources whenever we push to main.

### Creating `requirements.txt` for each Lambda

We have to make sure the requirements.txt python dependency file for every Lambda is up-to-date, which means:

- Starting up a virtual python environment inside the Lambda's dir: `source venv/bin/activate` (assuming venv dir is named "`venv`)
- `pip install` all the dependencies the lambda uses
- Create the `requirements.txt` by running `pip freeze > requirements.txt` inside the Lambda's directory.
