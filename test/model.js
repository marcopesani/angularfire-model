'use strict';

describe('$firebaseModel', function () {

    var $firebaseModel = null;

    beforeEach(function () {
        module('marcopesani.ngFirebaseModel');
        
        inject(function (_$firebaseModel_) {
            $firebaseModel = _$firebaseModel_;
        });
    });

    it('should be able to inject the model service', function () {
        expect($firebaseModel).not.toBeNull();
    });
});