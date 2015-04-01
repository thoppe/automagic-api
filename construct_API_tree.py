import glob
import codecs
import bs4
import os
from pprint import pprint
import collections

project_name = "jeopardy"
project_dir  = "samples/jeo/"

game_list = glob.glob(os.path.join(project_dir,'*'))
f_graph = "d3_viewer/input_graph.json"

dinner = []
for f_game in game_list:
    with codecs.open(f_game,'r','utf-8') as FIN:
        dinner.append(bs4.BeautifulSoup(FIN.read()))

def has_attribute(x):
    return x is not None

def ITR_attribute(tag):
    for soup in dinner:
        for x in soup.findAll(True,{tag:has_attribute}):
            yield x

def count_hash(name,tag):
    C = collections.Counter()
    for soup in dinner:
        for cx in soup.findAll(True,{tag:name}):
            text = cx.text.strip()
            C[cx] += 1
    return C

def hash_tags(tag):
    H = collections.defaultdict(collections.Counter)
    for name in TAGS[tag]:
        H[name] = count_hash(name,tag)
    return H

def has_named_parent(cx):
    for p in cx.parents:
        #if "id" in p.attrs or "class" in p.attrs:
        if "class" in p.attrs:
            return p
        if p.name == "html":
            break
    return None

def iterate_names(p):
    # Multiple class names need to be handled
    if p is None: return
    if "id" in p.attrs:
        yield p["id"]
    if "class" in p.attrs:
        for name in p["class"]:
            yield name

def find_named_parents(name,tag):
    result = collections.Counter()
    for soup in dinner:
        for cx in soup.findAll(True,{tag:name}):
            p = has_named_parent(cx)
            for parent_name in iterate_names(p):
                result[parent_name] += 1
    return result

def find_example_text(name,tag,count=5,cutoff=100):
    samples = []
    for soup in dinner:
        for val in soup.findAll(True,{tag:name}):
            text = val.text.strip()[:cutoff].strip()
            if text:
                samples.append(text)
            if count == len(samples):
                return samples


TAGS = collections.defaultdict(collections.Counter)

for x in ITR_attribute('class'):
    for cx in x["class"]:
        TAGS['class'][cx] += 1

#for x in ITR_attribute('id'):
#    TAGS['id'][x["id"]] += 1

print "Tags"
pprint(dict(TAGS['class']))

##################################################################

UNIQUE = collections.defaultdict(collections.Counter)
UNIQUE['class'] = hash_tags("class")

for name in UNIQUE['class']:
    total = len(UNIQUE['class'][name])
    if total == 1:
        print name, "possibly repeated text, dropping"
        TAGS['class'].pop(name)
print

##################################################################

import networkx as nx
import pygraphviz as pgv

# Build a graph of the sibling parent relationship
G = nx.DiGraph()
for tag in TAGS:
    for name in TAGS[tag]:
        G.add_node(name, name=name)

# Identify all the parents
for tag in TAGS:
    for name in TAGS[tag]:
        parents = find_named_parents(name,tag)
        total_weight = float(sum(parents.values()))
        for parent,weight in parents.items():
            scaled_weight = weight/total_weight
            edge = G.add_edge(parent,name,w=scaled_weight)
            print parent,name

# Find singletons and remove them
print "Singleton names"
singleton_names = [name for name,x in G.degree().items() if not x]
for name in singleton_names:
    G.remove_node(name)

# Find the root nodes
root_nodes = [n for n,d in G.in_degree().items() if d==0] 

# Find the depth of each node to a root node
for name in G.nodes():
    paths = []
    for root in root_nodes:
        try:
            dx = len(nx.shortest_path(G, root, name))
            paths.append(dx)
        except nx.exception.NetworkXNoPath:
            pass

    if paths:
        depth = min(paths)
    else:
        depth = 0

    G.node[name]["depth"] = depth

# Save the graph to file
import json
from networkx.readwrite import json_graph
js = json_graph.node_link_data(G)


pos = nx.graphviz_layout(G,prog='dot') #'dot'
labels = nx.get_node_attributes(G,'name')

px, py = zip(*pos.values())

for node in js["nodes"]:
    name = node["name"]
    x,y = pos[name]

    # Flip the y coordinates
    y = max(py) - (y - min(py))

    node["x"] = x
    node["y"] = y
    node["fixed"] = 0
    node["depth"] = node["depth"]

    print name
    sx = find_example_text(name,'class')
    if sx:
        node["sample_text"] = "\n<hr>\n".join(sx)
    else:
        node["sample_text"] = ""

    # Drop "id", it is the same as "name"
    node.pop("id")

js["project_name"] = project_name

with open(f_graph,'w') as FOUT:
    json.dump(js,FOUT,indent=2)

import pylab as plt
nx.draw(G,pos,alpha=0.25,ew=0)
nx.draw_networkx_labels(G,pos,labels,font_size=12)
plt.show()





    

