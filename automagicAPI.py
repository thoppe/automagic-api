import json
import bs4
import requests
import requests_cache

requests_cache.install_cache()

def depth_first(obj, path):
    if not obj:
        yield path
    
    for key in obj:
        p2 = list(path)
        p2.append(key)

        for result in depth_first(obj[key],p2):
            yield result

f_API_json = "samples/jeo.api"
url = "http://j-archive.com/showgame.php"
payload = {"game_id":4860}

with open(f_API_json) as FIN:
    js = json.load(FIN)

end_points = [x for x in depth_first(js,[])]

req  = requests.get(url,params=payload)
soup = bs4.BeautifulSoup(req.content,'html5')

def dive(path, spoon):
    print "PATHING!",path,len(spoon)

    if not path:
        yield spoon

    else:
        for block in spoon.findAll(True,{"class":path}):
            for result in dive(path[1:],block):
                yield result
       

for path in end_points:
    print path
    for x in dive(path,soup):
        print x
    exit()
exit()
        

for name in js:
    block = soup.find(True,{"class":name})
    print name, block.find(text=True,recursive=False)



