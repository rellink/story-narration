var EntitySearch = function() {};

var service_url = 'https://kgsearch.googleapis.com/v1/entities:search';

EntitySearch.query = function(keyword) {
  var params = {
    'query': keyword,
    'limit': 10,
    'key' : GOOGLE_KNOWLEDGE_API_KEY,
  };
  $.getJSON(service_url + '?callback=?', params, function(response) {
    $.each(response.itemListElement, function(i, element) {
      $('<div>', { text: element['result']['name'] }).appendTo(document.body);
    });
    var results = [];
    response.itemListElement.forEach(function(item) {

    });
  });
};


window.EntitySearch = EntitySearch;
