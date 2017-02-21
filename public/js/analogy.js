var Analogy = function(graph) {
  this.selectedNode = null;
  this.active = false;
  this.graph = graph;

  this.searchBox = new Awesomplete($('.node-search-box-analogy')[0], {
    autoFirst: true,
    minChars: 0,
    maxItems: 20,
  	list: this.graph.getNodeLabels(),
  });

  this.bindEvents();
};

Analogy.prototype.bindEvents = function() {
  var self = this;

  $('.story-info-header button.analogy').click(this.toggle.bind(this));
  $('.node-search-box-analogy')
    .on('click', function() {
      $(this).val('');
    })
    .on('blur', function() {
      $(this).val(self.selectedNode ? self.selectedNode.label : '');
    })
    .on('awesomplete-selectcomplete', function() {
      var node = self.graph.getNodeFromLabel($(this).val());
      self.selectNode(node);
    });

  // Subscribe from source node change
  document.addEventListener('rellink:node-select', function(e) {
    if(self.active && self.selectedNode) {
      self.makeAnalogy(e.detail, self.selectedNode);
    }
  });
}

Analogy.prototype.toggle = function() {
  if(this.active) this.hide();
  else this.show();
}

Analogy.prototype.show = function() {
  $('.node-search.analogy').show();
  $('.analogy-info').show();

  if(!this.selectedNode) {
    $('.analogy-info .description')
      .empty()
      .append($('<span class="loading">No node selected for analogy</span>'));
  }

  this.active = true;
}

Analogy.prototype.hide = function() {
  $('.node-search.analogy').hide();
  $('.analogy-info').hide();
  this.active = false;
}

Analogy.prototype.selectNode = function(node) {
  var sourceNode = this.graph.getNodeFromLabel($('.node-search-box').val());

  if(!sourceNode) return;

  if(this.selectedNode) {
    this.unhighlightNode(this.selectedNode);
  }

  this.selectedNode = node;
  this.highlightNode(node);
  this.makeAnalogy(sourceNode, node);
}

Analogy.prototype.highlightNode = function(node) {
  this.graph.updateNodeProperty(node.uri, {
    type: 'equilateral',
    borderColor: '#777777'
  });
}

Analogy.prototype.unhighlightNode = function(node) {
  this.graph.updateNodeProperty(node.uri, {
    type: 'circle',
    borderColor: undefined
  });
}

Analogy.prototype.makeAnalogy = function(sourceNode, targetNode) {
  var $description = $('.analogy-info .description');

  $description.empty().append($('<span class="loading">Loading analogy ...</span>'));

  // Load analogy
  $.post(
    Config.ANALOGY_API + '/get_analogy',
    {
      file1: 'roman_empire_1000_v3_AIMind.xml',
      file2: 'roman_empire_1000_v3_AIMind.xml',
      feature1: sourceNode.label,
      feature2: targetNode.label
    },
    function(response) {
      console.log(response);
      $description.text('Score:'+response.total_score.toFixed(3));

      var edges = this.parseEdgeMappings(sourceNode.uri, targetNode.uri, response.mapping);
      console.log(edges);
      this.graph.highlightEdges(edges);
      this.graph.render();

    }.bind(this),
    'json'
  );
}

Analogy.prototype.parseEdgeMappings = function(sourceNodeUri, targetNodeUri, mappings) {
  var edges = [];
  mappings.forEach(function(m) {
    if(m[0][0] == 'INCOMING') {
      edges.push({
        source: this.graph.getNodeFromLabel(m[0][2]).uri,
        target: sourceNodeUri,
        color: '#91ccff',
      });
      edges.push({
        source: this.graph.getNodeFromLabel(m[1][1]).uri,
        target: targetNodeUri,
        color: '#ffc491',
      });
    } else {
      edges.push({
        source: sourceNodeUri,
        target: this.graph.getNodeFromLabel(m[0][2]).uri,
        color: '#91ccff',
      });
      edges.push({
        source: targetNodeUri,
        target: this.graph.getNodeFromLabel(m[1][1]).uri,
        color: '#ffc491',
      });
    }
  }.bind(this));
  return edges;
}
