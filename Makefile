construct:
	python construct_API_tree.py --name Jeopardy samples/jeo/*

select: 
	python select_API_tree.py d3_viewer/input_graph.json

build:
	python build_API_from_tree.py samples/output_graph.svg samples/jeopardy.api

query:
	python automagicAPI.py samples/jeopardy.api
