import sys
import json

try:
    while True:
        line = sys.stdin.readline()
        if not line:
            break
        if line[0] != "{":
            continue
        query = json.loads(line)
        print(query, flush=True)

except KeyboardInterrupt:
    pass
