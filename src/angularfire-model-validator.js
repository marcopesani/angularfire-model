/*!
 * AngularFire Model Validator 0.0.1
 * https://github.com/marcopesani/angularfire-model/
 * Date: 31/05/2015
 * License: MIT
 */
(function (angular) {
    'use strict';

    angular.module('marcopesani.ngFirebaseModelValidator').factory('$firebaseModelValidator', [
        '$log',
        function ($log) {
            /**
             * This constructor should never be called manually.
             *
             * @param {object} options
             * @returns {FirebaseModelValidator}
             * @constructor
             */
            var FirebaseModelValidator = function (options) {
                if (!(this instanceof FirebaseModelValidator)) {
                    return new FirebaseModelValidator(options);
                }
                this.$$rules = {};
                this.$$debug = (options && options.debug) ? options.debug : false;
                return this;
            };

            FirebaseModelValidator.prototype = {
                /**
                 * Add a rule to validate a specific attribute of the model.
                 *
                 * Basic Rules
                 * - NotBlank
                 * - Blank
                 * - NotNull
                 * - Null
                 * - True
                 * - False
                 * - Type
                 *
                 * String rules
                 * - Email
                 * - Length
                 * - Url
                 * - Regex
                 * - Ip
                 * - Uuid
                 *
                 * Number rules
                 * - Range
                 *
                 * Vincoli di confronto
                 * - EqualTo
                 * - NotEqualTo
                 * - IdenticalTo
                 * - NotIdenticalTo
                 * - LessThan
                 * - LessThanOrEqual
                 * - GreaterThan
                 * - GreaterThanOrEqual
                 *
                 * - Date rules
                 * - Date
                 * - DateTime
                 * - Time
                 *
                 * Group rules
                 * - Choice
                 * - Collection
                 * - Count
                 * - UniqueEntity
                 * - Language
                 * - Locale
                 * - Country
                 *
                 * @param {String} key
                 * @param {String} type
                 * @param {Number, String or Object} options
                 * @returns {FirebaseObject} this
                 * @constructor
                 */
                $addValidationRule: function (key, type, options) {
                    if (key && type) {
                        this.$$rules[key] = {};
                        this.$$rules[key].type = type;
                        if (options) {
                            this.$$rules[key].options = options;
                        }
                    } else {
                        $log.error('$firebaseModel.$addValidationRule requires the key to check and the rule to apply.');
                    }
                },
                $validate: function (object) {
                    var message = {
                        success: true
                    };

                    function addError(key, error) {
                        message.success = false;
                        message[key] = message[key] || [];
                        message[key].push(error);
                    }

                    angular.forEach(this.$$rules, function (value, key) {
                        var rule = value.type;

                        switch (rule) {
                        case 'NotBlank':
                            if (!object[key] || object[key] === '') {
                                addError(key, key + ': This value should not be blank');
                            }
                            break;
                        case 'Blank':
                            if (!object[key] || object[key] !== '') {
                                addError(key, key + ': This value should be blank');
                            }
                            break;
                        case 'NotNull':
                            if (!object[key]) {
                                addError(key, key + ': This value should exists');
                            }
                            break;
                        case 'Null':
                            if (object[key]) {
                                addError(key, key + ': This value should not exists');
                            }
                            break;
                        case 'True':
                            if (object[key] === true) {
                                addError(key, key + ': This value should be true');
                            }
                            break;
                        case 'False':
                            if (object[key] === false) {
                                addError(key, key + ': This value should be false');
                            }
                            break;
                        case 'Type':
                            break;
                        }
                    });

                    return message;
                }
            };
            return FirebaseModelValidator;
        }]);
}(window.angular));