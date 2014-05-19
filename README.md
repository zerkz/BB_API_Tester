Useful Tests
============

**NOTE:** the test framework does not currenctly support bundles. use -p [prodId] to specify a non bundle product 

## Cart

`node test cart -r` - add, update, remove

`node test custom_sets -s toggleGift`  - add, toggle `_bb_gift` property of a product


## Checkout

`node test checkout -s specialEvent` - submit order with special events


## Miscellaneous

`node test misc -s emailSignup`  - email signup

`node test misc -s submitContactUs -r` - parse and submit form to contact us

`node test misc -s submitCatalog` - parse and submit catalog
