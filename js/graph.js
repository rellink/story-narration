var Graph = function() {
  this.data = {
    nodes: [],
    edges: []
  };
  this.sigma = new sigma({
    renderer: {
      container: document.getElementById('graph'),
      type: 'webgl'
    },
    settings: {
      defaultNodeType: 'fast',
      defaultEdgeType: 'fast'
    }
  });
};

// github.com/Adebis/NarrativeBackendRPI

Graph.prototype.loadJSON = function(url) {
  return $.getJSON(url, {}, this.importJSON.bind(this));
}

Graph.prototype.loadAIMind = function(url) {
  return $.get(url, {}, function(data) {
    // Turn data into JSON
    var json = {};

    var root = data.children[0].getElementsByTagName('Root')[0].getAttribute('id');
    var features = data.children[0].getElementsByTagName('Feature');

    var nodes = [], edges = [], checkNode = {};
    // Populate nodes
    Array.from(features).forEach(function(feature) {
      nodes.push({
        uri: feature.getAttribute('id'),
        label: feature.getAttribute('data'),
        properties: {}
      });
      checkNode[feature.getAttribute('id')] = true;
    });
    // Populate edges
    Array.from(features).forEach(function(feature) {
      Array.from(feature.getElementsByTagName('neighbor')).forEach(function(neighbor) {
        if(checkNode[feature.getAttribute('id')] &&
           checkNode[neighbor.getAttribute('dest')] ) {
          edges.push({
            s: feature.getAttribute('id'),
            t: neighbor.getAttribute('dest'),
            r: neighbor.getAttribute('relationship')
          });
        }
      });
    });

    this.importJSON({ nodes:nodes, edges:edges });
  }.bind(this));
}

Graph.prototype.render = function() {
  // Finally, let's ask our sigma instance to refresh:
  this.sigma.refresh();
  // this.sigma.startForceAtlas2({
  //   adjustSizes: true
  // });
}

Graph.prototype.importJSON = function(data) {
  this.data = data;

  // Calculate weights of nodes
  var weight = {},
      maxWeight = 0;
  var increaseWeight = function(uri) {
    weight[uri] = weight[uri] ? weight[uri]+1 : 1;
  }
  // Map weights
  data.edges.forEach(function(edge){
    increaseWeight(edge.s);
    increaseWeight(edge.t);
  });
  // Normalize weights
  Object.keys(weight).map(function(uri) {
    weight[uri] = normalizeWeight(weight[uri]);
    maxWeight = Math.max(weight[uri], maxWeight);
  });

  // Populate nodes
  data.nodes.forEach(function(node){
    this.sigma.graph.addNode({
      // Main attributes:
      id: node.uri, // ****** HACK!!!! *****
      label: node.label || node.uri.split('/').pop(),
      x: Math.random(),
      y: Math.random(),
      size: weight[node.uri],
      // Display attributes:
      color: getColorFromScale(weight[node.uri]/maxWeight)
    });
  }.bind(this));

  // Populate edges
  data.edges.forEach(function(edge){
    this.sigma.graph.addEdge({
      id: edge.s + ' ' + edge.t,
      source: edge.s,
      target: edge.t,
      label: edge.r,
      color: '#44A8FF',
      hidden: true
    });
  }.bind(this));

  // Bind events
  bindEvents(this.sigma);
}

Graph.prototype.forceLayout = function(onDone) {
  App.graph.sigma.startForceAtlas2();
  setTimeout(function(){
    App.graph.sigma.stopForceAtlas2();
    onDone();
  }, 3000);
}

/* Helper functions */

function bindEvents(s) {

  function activateNodes(toKeep, nodeId) {
    s.graph.nodes().forEach(function(n) {
      if (!toKeep[n.id]) {
        n.hidden = true;
      }
    });

    s.graph.edges().forEach(function(e) {
      if (e.source == nodeId || e.target == nodeId) {
        e.hidden = false;
      } else {
        e.hidden = true;
      }
    });

    s.refresh();
  }

  function deactivateNodes() {
    s.graph.nodes().forEach(function(n) {
      n.hidden = false;
    });

    s.graph.edges().forEach(function(e) {
      e.hidden = true;
    });

    s.refresh();
  }

  s.bind('clickNode', function(e) {
    var nodeId = e.data.node.id,
        toKeep = s.graph.neighbors(nodeId);
    toKeep[nodeId] = e.data.node;

    if(s.activeNode != nodeId) {
      s.activeNode = nodeId;
      activateNodes(toKeep, nodeId);
    } else {
      deactivateNodes();
      s.activeNode = null;
    }
  });

  s.bind('overNode', function(e) {
    if(s.activeNode) return;

    var nodeId = e.data.node.id,
        toKeep = s.graph.neighbors(nodeId);
    toKeep[nodeId] = e.data.node;

    activateNodes(toKeep, nodeId);
  });

  // When the stage is clicked, we just color each
  // node and edge with its original color.
  s.bind('outNode', function(e) {
    if(s.activeNode) return;

    deactivateNodes();
  });
}

function normalizeWeight(weight) {
  return 1 + Math.log(weight);
}

function getColorFromScale(value) {
	var h = (1.0 - value) * 240
	return tinycolor("hsl(" + h + ", 100%, 50%)").toHexString();
}

// Export
window.Graph = Graph;
