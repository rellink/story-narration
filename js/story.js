var Story = function(name, graph) {
  this.name = name;
  this.graph = graph;
};

Story.prototype.load = function(url, type, onDone) {
  return this.graph.load(url, type, function() {
    this.renderStoryInfo();
    onDone();
  }.bind(this));
};

Story.prototype.renderStoryInfo = function() {
  this.storyInfo = new StoryInfo(this.name, this.graph);
  this.storyInfo.render();
};
