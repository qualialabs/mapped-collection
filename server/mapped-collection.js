class MappedCollection {

  /**
    collection: the Mongo collection to map into memory
    query: the Mongo-style query object to run on the collection and observe for
      changes
    fields: the Mongo-style fields object describing the DB projection, or an
      array of fields to keep
    mapFunction: an arbitrary mapping, sync or async, from the fields of each
      document to new ones
  */
  constructor({collection, query, fields, mapFunction}) {
    this.collection = collection;
    this.query = query || {};
    this.mapFunction = mapFunction || _.identity;

    if (_.isArray(fields)) {
      // List of fields to keep
      const fieldObject = {};
      fields.forEach(f => fieldObject[f] = 1);
      this.fields = fieldObject;
    } else if (fields) {
      // Mongo-style object
      this.fields = fields;
    } else {
      // Include all fields
      this.fields = {};
    }

    // The main map, from document ID to projected fields
    this.map = undefined;

    // The collection cursor through which to observe changes
    this.cursor = undefined;

    // this.ready will resolve when the map is finished building
    this.onReady = undefined;
    this.ready = new Promise((resolve, reject) => {
      this.onReady = resolve;
    });

    this._init();
  }

  _init() {
    // Build the map on the next turn of the event loop
    Meteor.defer(() => {
      this.map = new Map();
      this.cursor = this.collection.find(this.query, {
        fields: this.fields,
        transform: false,
      });

      // observe will add each document to the map before returning
      this.cursor.observe({
        added: doc => {
          this.map.set(doc._id, Promise.await(this.mapFunction(doc)));
        },
        changed: doc => {
          this.map.set(doc._id, Promise.await(this.mapFunction(doc)));
        },
        removed: doc => {
          this.map.delete(doc._id);
        },
      });
      this.onReady();
    });
  }

}

export {MappedCollection};
