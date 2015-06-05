'use strict';

describe('$firebaseModelValidator when the validation rule is set to "False",', function () {

    // load the service's module
    beforeEach(module('marcopesani.ngFirebaseModel'));

    var _$firebaseModelValidator;
    beforeEach(inject(['$firebaseModelValidator', function ($firebaseModelValidator) {
        _$firebaseModelValidator = $firebaseModelValidator();
    }]));

    it('should validate a key set to "false"', function () {
        var key = 'testKey';
        var type = 'False';
        var object = {};

        object[key] = false;
        _$firebaseModelValidator.$addValidationRule(key, type);
        var message = _$firebaseModelValidator.$validate(object);
        expect(message.success).toBe(true);
    });

    it('should not validate a key set to "true"', function () {
        var key = 'testKey';
        var type = 'False';
        var object = {};

        object[key] = true;
        _$firebaseModelValidator.$addValidationRule(key, type);
        var message = _$firebaseModelValidator.$validate(object);

        expect(message.success).toBe(false);
        expect(message[key]).not.toBeUndefined();
        if (message[key]) {
            expect(message[key][0]).toBe('This value should be false');
        }
    });
});