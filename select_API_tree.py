import src.http_server
import argparse


if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument("input_graph", type=str, 
                        default="d3_viewer/input_graph.json",
                        help="JSON graph from construct_API_tree.py")
    
    args = parser.parse_args()

    src.http_server.load_url("d3_viewer/viewer.html")
