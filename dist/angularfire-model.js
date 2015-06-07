/*!
 * AngularFire Model 0.0.1
 * https://github.com/marcopesani/angularfire-model/
 * Date: 31/05/2015
 * License: MIT
 */
(function (angular) {
    'use strict';

    angular.module('marcopesani.ngFirebaseModel', ['firebase']).factory('$firebaseModel', [
        '$log',
        '$q',
        '$firebaseModelValidator',
        '$firebaseArray',
        '$firebaseObject',
        function ($log, $q, $firebaseModelValidator, $firebaseArray, $firebaseObject) {
            /**
             * This constructor should never be called manually.
             *
             * @param {String} modelName
             * @param {String} collectionName
             * @param {Firebase} firebaseReference
             * @returns {FirebaseModel}
             * @constructor
             */
            function FirebaseModel(modelName, collectionName, firebaseReference) {
                if (!(this instanceof FirebaseModel)) {
                    return new FirebaseModel(modelName, collectionName, firebaseReference);
                }
                this.$$baseRef = firebaseReference;
                this.$$modelRef = firebaseReference.child(collectionName);
                this.$$modelName = modelName;
                this.$$modelCollection = collectionName;
                this.$$schema = {};
                this.$$validator = $firebaseModelValidator({
                    debug: true
                });

                return this;
            }

            FirebaseModel.prototype = {
                /**
                 * Return a FirebaseArray containing all the objects present inside
                 * the collection defined by the reference.
                 *
                 * @returns {FirebaseArray}
                 * @constructor
                 */
                $all: function () {
                    return $firebaseArray(this.$$modelRef);
                },
                /**
                 * Return a FirebaseObject containg the value of the specified key.
                 *
                 * @param {String} id
                 * @returns {FirebaseObject}
                 * @constructor
                 */
                $one: function (id) {
                    var objRef = this.$$modelRef.child(id);
                    return $firebaseObject(objRef);
                },
                // --------------------------------------------------------------------------------------
                $add: function (obj) {
                    var self = this,
                        newObjRef,
                        deferred = $q.defer(),
                        message = this.$$validator.$validate(obj);

                    if (message.success === true) {
                        newObjRef = this.$$modelRef.push(obj);
                        newObjRef.once('value', function (snapshot) {
                            var newObj = (snapshot.exists()) ? snapshot.val() : null;
                            if (newObj) {
                                angular.forEach(newObj, function (value, key) {
                                    if (self.$$schema[key] && self.$$schema[key].type === 'relationship') {
                                        self.$$createRelationship(snapshot.key(), value, self.$$schema[key]);
                                    }
                                });
                                deferred.resolve(message);
                            }
                        });
                    } else {
                        deferred.reject(message);
                    }

                    return deferred.promise;
                },
                /**
                 * Check if a specified object passes all the validation rules
                 *
                 * @param {String} obj
                 * @returns {Boolean}
                 * @constructor
                 */
                $isValid: function (obj) {
                    var message = this.$$validator.$validate(obj);

                    return message.success;
                },
                // --------------------------------------------------------------------------------------
                $remove: function (id) {
                    var self = this,
                        removeObjRef = this.$$modelRef.child(id);

                    removeObjRef.once('value', function (snapshot) {
                        var removeObj = (snapshot.exists()) ? snapshot.val() : null;
                        if (removeObj) {
                            angular.forEach(removeObj, function (value, key) {
                                if (self.$$schema[key] && self.$$schema[key].type === 'relationship') {
                                    self.$$removeRelationship(snapshot.key(), value, self.$$schema[key]);
                                }
                            });
                        }
                        removeObjRef.remove();
                    });
                },
                // --------------------------------------------------------------------------------------
                $addRelationship: function (key, options) {
                    var attribute = {
                        type: 'relationship',
                        localType: options.localType,
                        foreingType: options.foreingType,
                        foreingCollection: options.foreingCollection
                    };

                    if (!options.foreingKey) {
                        switch (attribute.foreingType) {
                        case 'value':
                            attribute.foreingKey = this.$$modelName;
                            break;
                        case 'collection':
                            attribute.foreingKey = this.$$modelCollection;
                            break;
                        }
                    } else {
                        attribute.foreingKey = options.foreingKey;
                    }

                    this.$$schema[key] = attribute;
                    return this;
                },
                // --------------------------------------------------------------------------------------
                $addAttribute: function (key) {
                    var attribute = {
                        type: 'attribute'
                    };
                    this.$$schema[key] = attribute;
                    return this;
                },
                /**
                 * Add a rule to validate a specific attribute of the model.
                 *
                 * @param {String} key
                 * @param {String} type
                 * @param {Number, String or Object} options
                 * @returns {FirebaseObject} this
                 * @constructor
                 */
                $addValidationRule: function (key, type, options) {
                    this.$$validator.$addValidationRule(key, type, options);

                    return this;
                },
                // --------------------------------------------------------------------------------------
                $$createRelationship: function (id, value, options) {
                    var self = this,
                        insertRelation = function (insertId, inserValue, insertOptions) {
                            if (insertOptions.foreingType === 'value') {
                                self.$$baseRef
                                    .child(insertOptions.foreingCollection)
                                    .child(inserValue)
                                    .child(insertOptions.foreingKey)
                                    .set(insertId);
                            } else if (insertOptions.foreingType === 'collection') {
                                self.$$baseRef
                                    .child(insertOptions.foreingCollection)
                                    .child(inserValue)
                                    .child(insertOptions.foreingKey)
                                    .child(insertId)
                                    .set(true);
                            }
                        };

                    switch (options.localType) {
                    case 'value':
                        insertRelation(id, value, options);
                        break;
                    case 'collection':
                        angular.forEach(value, function (val, key) {
                            insertRelation(id, key, options);
                        });
                        break;
                    default:
                        $log.error('$firebaseModel.$$createRelationship can handle only string or objects.');
                    }
                },
                // --------------------------------------------------------------------------------------
                $$removeRelationship: function (id, value, options) {
                    var self = this,
                        removeRelation = function (removeId, removeValue, removeOptions) {
                            if (removeOptions.foreingType === 'value') {
                                self.$$baseRef
                                    .child(removeOptions.foreingCollection)
                                    .child(removeValue)
                                    .child(removeOptions.foreingKey)
                                    .remove();
                            } else if (removeOptions.foreingType === 'collection') {
                                self.$$baseRef
                                    .child(removeOptions.foreingCollection)
                                    .child(removeValue)
                                    .child(removeOptions.foreingKey)
                                    .child(removeId)
                                    .remove();
                            }
                        };

                    switch (options.localType) {
                    case 'value':
                        removeRelation(id, value, options);
                        break;
                    case 'collection':
                        angular.forEach(value, function (val, key) {
                            removeRelation(id, key, options);
                        });
                        break;
                    default:
                        $log.error('$firebaseModel.$$removeRelationship can handle only string or objects.');
                    }
                }
            };
            return FirebaseModel;
        }]);
}(window.angular));
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