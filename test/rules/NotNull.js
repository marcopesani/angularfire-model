'use strict';

describe('$firebaseModelValidator when the validation rule is set to "NotNull",', function () {

    // load the service's module
    beforeEach(module('marcopesani.ngFirebaseModel'));

    var _$firebaseModelValidator;
    beforeEach(inject(['$firebaseModelValidator', function ($firebaseModelValidator) {
        _$firebaseModelValidator = $firebaseModelValidator();
    }]));

    it('should not validate an existing key', function () {
        var key = 'testKey';
        var type = 'NotNull';
        var object = {};

        object[key] = 'foo';
        _$firebaseModelValidator.$addValidationRule(key, type);
        var message = _$firebaseModelValidator.$validate(object);
        expect(message.success).toBe(true);
    });

    it('should validate a non existing key', function () {
        var key = 'testKey';
        var type = 'NotNull';
        var object = {};

        _$firebaseModelValidator.$addValidationRule(key, type);
        var message = _$firebaseModelValidator.$validate(object);

        expect(message.success).toBe(false);
        expect(message[key]).not.toBeUndefined();
        if (message[key]) {
            expect(message[key][0]).toBe('This value should exists');
        }
    });
});