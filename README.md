# qualia:mapped-collection

Maintain a projection of a MongoDB collection in memory on your Meteor server,
for awesome possibilities!

Available on [Atmosphere](https://atmospherejs.com/qualia/mapped-collection).

## Usage

Let's say we have a collection of `Orders` and we want to search through them,
but MongoDB queries aren't quite expressive enough.

We only need to search over a small subset of the fields on each document. With
`MappedCollection`, we can project each order into an
[ES6 Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
in memory, then run  an arbitrary search algorithm on the map using normal
JavaScript!

First, we create the `MappedCollection`, specifying the collection we would like
to map into memory, and which fields we should
[project](https://docs.meteor.com/api/collections.html#fieldspecifiers)
from each document:

```js
import {MappedCollection} from 'meteor/qualia:mapped-collection';

const mappedFields = [
  'order_number',
  '_search.borrower_names',
  '_search.seller_names',
  '_search.lender_names',
  '_search.property_addresses',
  'properties.brief_legal_description',
  'cdf.loans.loan_number',
  'hud1.loans.loan_number',
  'status',
];

const mappedOrders = new MappedCollection({
  collection: Orders,
  fields: mappedFields,
});
```

Provide an array of field names or a Meteor-style fields object in `fields`.

Internally, MappedCollection uses an
[`observe`](https://docs.meteor.com/api/collections.html#Mongo-Cursor-observe)
to keep its map in sync with the collection.

After we construct `mappedOrders`, it might still be waiting to build the map
asynchronously. When our `mappedOrders` are ready, the Promise
`mappedOrders.ready` will resolve.

The map is available on the `MappedCollection` as `map`, and we use it to get
the values for our search once the map is ready:

```js
import lasr from 'meteor/qualia:lasr';

// mappedOrders.ready resolves when the map is fully initialized
Promise.await(mappedOrders.ready);

// mappedOrders.map is a normal ES6 Map
const orders = Array.from(mappedOrders.map.values());

// Here, we search for some orders, but you can do anything with the map!
const results = lasr.search({
  items: orders,
  query,
  keys: ['order_number'],
  limit: 10,
});
```

Here, we use [lasr](https://github.com/qualialabs/lasr/) for our search, but
you could use any search package, or do something unrelated to search!
