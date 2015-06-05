'use strict';

describe('$firebaseModelValidator', function () {

    // load the service's module
    beforeEach(module('marcopesani.ngFirebaseModel'));

    var _$firebaseModelValidator;
    beforeEach(inject(['$firebaseModelValidator', function ($firebaseModelValidator) {
        _$firebaseModelValidator = $firebaseModelValidator();
    }]));

    it('should be able to inject the validator service', function () {
        expect(_$firebaseModelValidator).not.toBeNull();
    });

    it('should validate every model if there are no defined rules', function () {
        var obj = {};
        var message = _$firebaseModelValidator.$validate(obj);

        expect(message.success).toBe(true);
    });
    
    it('shouldn\'t add a validation rule without the validation type', function () {
        _$firebaseModelValidator.$addValidationRule('testKey');
        expect(_$firebaseModelValidator.$$rules['testKey']).toBeUndefined();
    });
});