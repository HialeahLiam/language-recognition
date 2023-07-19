from dotenv import load_dotenv
from transformers import AutoModelForMaskedLM, AutoTokenizer
import torch
import openai
import os
import pinecone
import numpy
import json
import tiktoken

load_dotenv()

texts = [
    "farms.",
    " Where is that thing?",
    " The duty on corn I have accepted to the detriment of my country's crop farms.",
    " The tax on fish I have reluctantly acquiesced to, which will all but sink French fishing",
    " But we must omit the grape.",
]

with open("json.json") as file:
    transcription = json.load(file)

texts = [s["text"] for s in transcription["segments"]]

# remove empty entries
texts = [string for string in texts if string.strip()]

# model_id = "naver/splade-cocondenser-ensembledistil"
# model_id = "naver/splade_v2_max"
model_id = "naver/splade_v2_distil"
# model_id = "naver/splade-cocondenser-selfdistil"
# model_id = "naver/efficient-splade-V-large-query"
# model_id = "naver/efficient-splade-V-large-doc"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForMaskedLM.from_pretrained(model_id)


def generateSparseVectors(text):
    tokens = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    # for t in tokens.input_ids:
    #     print(tokenizer.convert_ids_to_tokens(t))
    # print(
    #     "decoded token strings: \n",
    # )
    # [print(s) for s in tokenizer.batch_decode(tokens.input_ids)]
    output = model(**tokens)
    # aggregate the token-level vecs and transform to sparse
    # We can upload these sparse vectors to Pinecone
    vecs = (
        torch.max(
            torch.log(1 + torch.relu(output.logits))
            * tokens.attention_mask.unsqueeze(-1),
            dim=1,
        )[0]
        .squeeze()
        .detach()
        .cpu()
        .numpy()
    )

    print("sparse vectors shape: ", vecs.shape)

    return vecs


def transformSparseVectorsIntoDict(vectors):
    if not isinstance(vectors[0], list) and not isinstance(vectors[0], numpy.ndarray):
        vectors = [vectors]
    # extract non-zero positions
    sparse_values = []
    for sparse_vector in vectors:
        indices = sparse_vector.nonzero()[0].tolist()  # Array of nonzero indices
        values = sparse_vector[indices].tolist()  # Array of corresponding values

        sparse_values.append({"indices": indices, "values": values})

    return sparse_values


def getEmbeddingsFromOpenAI(text):
    encoding = tiktoken.get_encoding("cl100k_base")
    num_of_tokens = 0
    if isinstance(text, list):
        for t in text:
            num_of_tokens += len(encoding.encode(t))
    else:
        num_of_tokens = len(encoding.encode(t))
    print("num of tokens: ", num_of_tokens)

    openai.api_key = os.getenv("OPENAI_API_KEY")
    dense_embeddings_response = openai.Embedding.create(
        model="text-embedding-ada-002", input=text
    )
    return [object.embedding for object in dense_embeddings_response.data]


def buildPineconeVectorObject(dense_vector, sparse_values, id, text):
    return {
        "id": id,
        "values": dense_vector,
        "sparse_values": sparse_values,
        "metadata": {"text": text},
    }


def main():
    vecs = generateSparseVectors(texts)

    sparse_values = transformSparseVectorsIntoDict(vecs)
    dense_vectors = getEmbeddingsFromOpenAI(texts)

    pinecone.init(
        api_key=os.getenv("PINECONE_API_KEY"),
        environment=os.getenv("PINECONE_ENV"),
    )

    index = pinecone.Index("english-snippets")

    upsert_response = index.upsert(
        vectors=[
            buildPineconeVectorObject(vec, sparse_values[i], str(i), text=texts[i])
            for i, vec in enumerate(dense_vectors)
        ]
    )

    print(upsert_response)


if __name__ == "__main__":
    main()
