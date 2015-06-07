/*!
 * AngularFire Model Validator 0.0.1
 * https://github.com/marcopesani/angularfire-model/
 * Date: 31/05/2015
 * License: MIT
 */
(function (angular, moment) {
    'use strict';

    angular.module('marcopesani.ngFirebaseModel').factory('$firebaseModelValidator', [
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
                 * Validation rules inspired by:
                 * http://symfony.com/it/doc/current/book/validation.html
                 *
                 * @param {String} key
                 * @param {String} type
                 * @param {Number, String or Object} options
                 * @returns {FirebaseObject} this
                 * @constructor
                 */
                $addValidationRule: function (key, type, options) {
                    if (key && type) {
                        var rule = {
                            type: type,
                            options: options || undefined
                        };
                        this.$$rules[key] = this.$$rules[key] || [];
                        this.$$rules[key].push(rule);
                    } else {
                        $log.error('$firebaseModel.$addValidationRule requires the key to check and the rule to apply.');
                    }
                },
                $validate: function (object) {
                    var self = this,
                        message = {
                            success: true
                        };

                    function addError(key, error) {
                        message.success = false;
                        message[key] = message[key] || [];
                        message[key].push(error);
                    }

                    angular.forEach(this.$$rules, function (value, key) {
                        var rules = self.$$rules[key];

                        angular.forEach(rules, function (rule) {

                            switch (rule.type) {
                            case 'NotBlank':
                                if (!object[key] || object[key] === '') {
                                    addError(key, 'This value should not be blank');
                                }
                                break;
                            case 'Blank':
                                if (object[key] || object[key].length !== 0) {
                                    addError(key, 'This value should be blank');
                                }
                                break;
                            case 'NotNull':
                                if (!object[key]) {
                                    addError(key, 'This value should exists');
                                }
                                break;
                            case 'Null':
                                if (object[key]) {
                                    addError(key, 'This value should not exists');
                                }
                                break;
                            case 'True':
                                if (object[key] !== true) {
                                    addError(key, 'This value should be true');
                                }
                                break;
                            case 'False':
                                if (object[key] !== false) {
                                    addError(key, 'This value should be false');
                                }
                                break;
                            case 'Date':
                                if (!moment(object[key], 'YYYY-MM-DD').isValid()) {
                                    addError(key, 'This is not a valid ISO8601 Date string, the format should be YY-MM-DD');
                                }
                                break;
                            case 'Time':
                                if (!moment(object[key], 'HH:mm:ssZ').isValid()) {
                                    addError(key, 'This is not a valid ISO8601 Time string, the format should be HH:mm:ssZ');
                                }
                                break;
                            case 'DateTime':
                                if (!moment(object[key], 'YYYY-MM-DDTHH:mm:ssZ').isValid()) {
                                    addError(key, 'This is not a valid ISO8601 DateTime string, the format should be YYYY-MM-DDTHH:mm:ssZ');
                                }
                                break;
                            }
                        });
                    });

                    return message;
                }
            };
            return FirebaseModelValidator;
        }]);
}(window.angular, window.moment));