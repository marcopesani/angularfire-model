'use strict';

describe('$firebaseModelValidator when the validation rule is set to "Time",', function () {

    // load the service's module
    beforeEach(module('marcopesani.ngFirebaseModel'));

    var _$firebaseModelValidator;
    beforeEach(inject(['$firebaseModelValidator', function ($firebaseModelValidator) {
        _$firebaseModelValidator = $firebaseModelValidator();
    }]));

    it('should validate a key set to "00:00:00+00:00"', function () {
        var key = 'testKey';
        var type = 'Time';
        var object = {};

        object[key] = '00:00:00+00:00';
        _$firebaseModelValidator.$addValidationRule(key, type);
        var message = _$firebaseModelValidator.$validate(object);
        
        expect(message.success).toBe(true);
    });

    it('should not validate a key set to "not valid string"', function () {
        var key = 'testKey';
        var type = 'Time';
        var object = {};

        object[key] = 'not valid string';
        _$firebaseModelValidator.$addValidationRule(key, type);
        var message = _$firebaseModelValidator.$validate(object);

        expect(message.success).toBe(false);
        expect(message[key]).not.toBeUndefined();
        if (message[key]) {
            expect(message[key][0]).toBe('This is not a valid ISO8601 Time string, the format should be HH:mm:ssZ');
        }
    });
});