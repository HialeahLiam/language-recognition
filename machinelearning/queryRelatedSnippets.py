from sparseVectors import generateSparseVectors, transformSparseVectorsIntoDict
import pinecone
import sys, getopt, time
import os

pinecone.init(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment=os.getenv("PINECONE_ENV"),
)

index = pinecone.Index("english-snippets")


def doSparseVectorSearch(sparse_values, topK=10):
    OPENAI_VECTOR_DIMENSIONS = 1536
    return index.query(
        vector=[0 for _ in range(OPENAI_VECTOR_DIMENSIONS)],
        sparse_vector=sparse_values,
        top_k=topK,
        include_metadata=True,
    )


def main(argv):
    text = ""
    usage = "usage: script.py --text <sometext>"

    # parse incoming arguments
    try:
        opts, args = getopt.getopt(argv, "h:", ["text="])
    except getopt.GetoptError:
        print(usage)
        sys.exit(2)
    for opt, arg in opts:
        if opt == "-h":
            print(usage)
            sys.exit()
        elif opt in ("--text"):
            text = arg

    sparse_vectors = generateSparseVectors(text=text)
    print(sparse_vectors)
    sparse_values = transformSparseVectorsIntoDict(sparse_vectors)
    searchResult = doSparseVectorSearch(sparse_values=sparse_values[0])

    print("search result: ", searchResult)


if __name__ == "__main__":
    main(sys.argv[1:])
