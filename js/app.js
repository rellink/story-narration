var App = function() {};

App.start = function() {

};

App.selectTopic = function(url, type) {
  App.hideGetStarted();
  App.showLoading();

  App.graph = new Graph();
  App.graph
    .load(url, type)
    //.loadJSON(Config.KNOWLEDGE_API + '/graph?anchors=Google,Microsoft,Samsung,Amazon,IBM,Foxconn,Dell_Technologies,Alphabet_Inc.,HP_Inc.,Sony,Intel')
    //.loadAIMind(Config.TEST_XML)
    .done(function(){
      App.graph.render();
      App.graph.forceLayout(function() {
        App.hideLoading();
        App.hideOverlay();
      });
    });
};

App.hideGetStarted = function() {
  $('main.overlay .get-started').hide();
}

App.hideOverlay = function() {
  $('main.overlay').hide();
}

App.showLoading = function() {
  $('main.overlay .loading').css({ display: 'flex' });
}

App.hideLoading = function() {
  $('main.overlay .loading').hide();
}

// Export
window.App = App;
