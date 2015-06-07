'use strict';

describe('$firebaseModelValidator when the validation rule is set to "DateTime",', function () {

    // load the service's module
    beforeEach(module('marcopesani.ngFirebaseModel'));

    var _$firebaseModelValidator;
    beforeEach(inject(['$firebaseModelValidator', function ($firebaseModelValidator) {
        _$firebaseModelValidator = $firebaseModelValidator();
    }]));

    it('should validate a key set to "0000-01-01T00:00:00+00:00"', function () {
        var key = 'testKey';
        var type = 'DateTime';
        var object = {};

        object[key] = '0000-01-01T00:00:00+00:00';
        _$firebaseModelValidator.$addValidationRule(key, type);
        var message = _$firebaseModelValidator.$validate(object);
        
        expect(message.success).toBe(true);
    });

    it('should not validate a key set to "not valid string"', function () {
        var key = 'testKey';
        var type = 'DateTime';
        var object = {};

        object[key] = 'not valid string';
        _$firebaseModelValidator.$addValidationRule(key, type);
        var message = _$firebaseModelValidator.$validate(object);

        expect(message.success).toBe(false);
        expect(message[key]).not.toBeUndefined();
        if (message[key]) {
            expect(message[key][0]).toBe('This is not a valid ISO8601 DateTime string, the format should be YYYY-MM-DDTHH:mm:ssZ');
        }
    });
});