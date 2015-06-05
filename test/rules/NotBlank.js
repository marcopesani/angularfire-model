'use strict';

describe('$firebaseModelValidator when the validation rule is set to "NotBlank",', function () {

    // load the service's module
    beforeEach(module('marcopesani.ngFirebaseModel'));

    var _$firebaseModelValidator;
    beforeEach(inject(['$firebaseModelValidator', function ($firebaseModelValidator) {
        _$firebaseModelValidator = $firebaseModelValidator();
    }]));

    it('should validate the string "foo"', function () {
        var key = 'testKey';
        var type = 'NotBlank';
        var object = {};

        object[key] = 'foo';
        _$firebaseModelValidator.$addValidationRule(key, type);
        var message = _$firebaseModelValidator.$validate(object);
        expect(message.success).toBe(true);
    });

    it('should not validate the string ""', function () {
        var key = 'testKey';
        var type = 'NotBlank';
        var object = {};

        object[key] = '';
        _$firebaseModelValidator.$addValidationRule(key, type);
        var message = _$firebaseModelValidator.$validate(object);

        expect(message.success).toBe(false);
        expect(message[key]).not.toBeUndefined();
        if (message[key]) {
            expect(message[key][0]).toBe('This value should not be blank');
        }
    });
});