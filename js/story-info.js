var StoryInfo = function(name, graph) {
  this.name = name;
  this.graph = graph;
  this.selectedNode = '';
};

StoryInfo.prototype.render = function() {
  this.$el = $('.story-info');
  this.$el.find('.story-name').text(this.name);

  this.searchBox = new Awesomplete(this.$el.find('.node-search-box')[0], {
    autoFirst: true,
    minChars: 0,
    maxItems: 20,
  	list: this.graph.getNodeLabels(),
  });

  var self = this;

  this.$el.find('.node-search-box')
    .on('click', function() {
      $(this).val('');
    })
    .on('blur', function() {
      $(this).val(self.selectedNode);
    })
    .on('awesomplete-selectcomplete', function() {
      self.selectedNode = $(this).val();
    });

  this.$el.fadeIn();
}
