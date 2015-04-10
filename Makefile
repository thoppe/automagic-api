project_name=jeopardy
project_html=samples/jeo/*

project_name="physical_review"
project_html=samples/physrev/*

api_output=samples/$(project_name).api
construct:
	python construct_API_tree.py --name $(project_name) $(project_html)

select: 
	python select_API_tree.py d3_viewer/input_graph.json

build:
	python build_API_from_tree.py samples/output_graph.svg $(api_output)

query:
	python automagicAPI.py $(api_output)
