import codecs
import ast
import collections
import json
import bs4
import ast, pprint
import networkx as nx
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("input", type=str, 
                    default="samples/output_graph.svg",
                    help="Output from select_API_tree.py")

parser.add_argument("output", type=str, 
                    default="output.api",
                    help="Output API file")

parser.add_argument("show", default=False, action="store_true",
                    help="Render to graph")

args = parser.parse_args()


with codecs.open(args.input,'r','utf-8') as FIN:
    raw = FIN.read()
    soup = bs4.BeautifulSoup(raw,'xml')

# Clean it up so we can look at it
for g in soup.findAll(True):
    if "transform" in g.attrs:
        g.attrs.pop("transform")

    if "style" in g.attrs:
        g.attrs.pop("style")

    if "d" in g.attrs:
        g.attrs.pop("d")

    if "marker-end" in g.attrs:
        g.attrs.pop("marker-end")


# Build the reduced graph
G = nx.DiGraph()

# Add the nodes
for node in soup.findAll("g",{"class":"node"}):
    is_active = ast.literal_eval(node.attrs["selected"])
    gn = G.add_node(node.attrs["name"],
                    attrs={"active":is_active})

# Add the edges
for edge in soup.findAll("path",{"class":"link"}):
    G.add_edge(edge.attrs["source"],
               edge.attrs["target"])

def mark_upwards(name):
    G.node[name]["attrs"]["active"] = 1
    for parent in G.predecessors(name):
        mark_upwards(parent)

# Select upwards
for name in G.nodes():
    if G.node[name]["attrs"]["active"]:
        mark_upwards(name)

# Remove nodes not used
for name in G.nodes():
    if not G.node[name]["attrs"]["active"]:
        G.remove_node(name)

# Find the remaing root nodes
root_nodes = [n for n,d in G.in_degree().items() if d==0] 

def build_sucessor(name,obj):
    for child in G.successors(name):
        build_sucessor(child, obj[child])

# Print the tree special since it is so ugly
class prettyDict(collections.defaultdict):
    def __init__(self, *args, **kwargs):
        collections.defaultdict.__init__(self,*args,**kwargs)

    def __repr__(self):
        return str(dict(self))

tree_gen = lambda: prettyDict(tree_gen)
tree = tree_gen()
for root in root_nodes:
    build_sucessor(root, tree[root])

# Hack the tree back into a dict
tree = ast.literal_eval(str(tree))

jstr = json.dumps(tree,indent=2)
print jstr

with open(args.output,'w') as FOUT:
    FOUT.write(jstr)
