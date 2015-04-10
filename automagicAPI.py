import json
import bs4
import requests
import requests_cache
requests_cache.install_cache()

import argparse

def load_API(f_API_json):
    with open(f_API_json) as FIN:
        js = json.load(FIN)
    return js

def dive(path, spoon):
    data = {}

    for key in path:
        ITR  = spoon.findAll(attrs={"class":key})
        if not path[key]:
            result = [x.text for x in ITR]
        else:
            result = [dive(path[key],chunk) for chunk in ITR]
        data[key] = result

    return data


parser = argparse.ArgumentParser()
parser.add_argument("API", type=str, 
                    default="output.api",
                    help="API from build_API_from_tree.py")

args = parser.parse_args()
js = load_API(args.API)

url = "http://j-archive.com/showgame.php"
payload = {"game_id":4860}

req  = requests.get(url,params=payload)
soup = bs4.BeautifulSoup(req.content,'html5')
data = dive(js, soup)

from pprint import pprint
pprint(data)

