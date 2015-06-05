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
        '$firebaseArray',
        '$firebaseObject',
        function ($log, $q, $firebaseArray, $firebaseObject) {
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
                        newObjRef = this.$$modelRef.push(obj);

                    newObjRef.once('value', function (snapshot) {
                        var newObj = (snapshot.exists()) ? snapshot.val() : null;
                        if (newObj) {
                            angular.forEach(newObj, function (value, key) {
                                if (self.$$schema[key] && self.$$schema[key].type === 'relationship') {
                                    self.$$createRelationship(snapshot.key(), value, self.$$schema[key]);
                                }
                            });
                        }
                    });
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

                    switch (attribute.foreingType) {
                    case 'value':
                        attribute.foreingKey = this.$$modelName;
                        break;
                    case 'collection':
                        attribute.foreingKey = this.$$modelCollection;
                        break;
                    }

                    this.$$schema[key] = attribute;
                    return this;
                },
                // --------------------------------------------------------------------------------------
                $addAttribute: function (key, type) {
                    var attribute = {
                        type: type || 'string'
                    };
                    this.$$schema[key] = attribute;
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