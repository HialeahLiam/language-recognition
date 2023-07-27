import time
import logging

logging.basicConfig(filename="example.log", encoding="utf-8", level=logging.DEBUG)

st = time.time()

time.sleep(5)

et = time.time()

logging.debug(f"execution took: {et - st}s")
