'use strict';

/*global describe,beforeEach,inject,it,expect*/

describe('Service: normalDocsSvc', function () {

  // load the service's module
  beforeEach(module('o19s.splainer-search'));
 
  /*jshint camelcase: false */
  var normalDocsSvc = null;
  var vectorSvc = null;
  beforeEach(inject(function (_normalDocsSvc_, _vectorSvc_) {
    normalDocsSvc = _normalDocsSvc_;
    vectorSvc = _vectorSvc_;
  }));

  /* global mockExplain */
  describe('attached url tests', function() {
    var solrDoc = null;
    var normalDoc = null;
    var lastFieldName = null;
    var lastFieldValue = null;
    beforeEach(function() {
      solrDoc = {'id_field': '1234',
                 'title_field': 'a title',
                 url: function(fieldName, fieldValue) {
                    lastFieldName = fieldName;
                    lastFieldValue = fieldValue;
                  },
                 explain: function() {return mockExplain;} };
      var fieldSpec = {id: 'id_field', title: 'title_field'};
      normalDoc = normalDocsSvc.createNormalDoc(fieldSpec, solrDoc);
    });

    it('requests url correctly', function() {
      normalDoc.url();
      expect(lastFieldName).toEqual('id_field');
      expect(lastFieldValue).toEqual('1234');
    });

  });

  describe('explain tests', function() {
    var solrDoc = null;
    beforeEach(function() {
      var basicExplain1 = {
        match: true,
        value: 1.5,
        description: 'weight(text:law in 1234)',
        details: []
      };
      var basicExplain2 = {
        match: true,
        value: 0.5,
        description: 'weight(text:order in 1234)',
        details: []
      };

      var sumExplain = {
        match: true,
        value: 1.0,
        description: 'sum of',
        details: [basicExplain1, basicExplain2]
      };

      solrDoc = {'id_field': '1234',
                 'title_field': 'a title',
                 url: function() {return 'http://127.0.0.1';},
                 explain: function() {return sumExplain;} };
    });

    it('hot matches by max sorted by percentage', function() {
      var fieldSpec = {id: 'id_field', title: 'title_field'};
      var normalDoc = normalDocsSvc.createNormalDoc(fieldSpec, solrDoc);

      var hmOutOf = normalDoc.hotMatchesOutOf(2.0);
      expect(hmOutOf.length).toBe(2);
      expect(hmOutOf[0].percentage).toBe(75.0);
      expect(hmOutOf[0].description).toContain('law');
      expect(hmOutOf[1].percentage).toBe(25.0);
      expect(hmOutOf[1].description).toContain('order');

    });
  });

});
