all: summary.json

output.json: grab.rb urls.txt
	ruby grab.rb

summary.json: output.json summary.rb
	ruby summary.rb

.PHONY: all
