# Waterline-Sequel Changelog

### 0.6.2

* [BUG] Fix the second part of the issue from `0.6.0` this time by updating the complex queries. See [#85](https://github.com/balderdashy/waterline-sequel/pull/85) for more details. Thanks again to [@Bazze](https://github.com/Bazze), [@wulfsolter](https://github.com/wulfsolter) and others who helped debug this.

### 0.6.1

* [BUG] Fix an issue when populating the one side of a one-to-many association where virtual attributes were trying to be selected. See [#84](https://github.com/balderdashy/waterline-sequel/pull/84) for more details. Thanks [@Bazze](https://github.com/Bazze) for the issue submission.

### 0.6.0

* [ENHANCEMENT] Add the ability to use projections in join queries. See [#80](https://github.com/balderdashy/waterline-sequel/pull/80) for more details.

### 0.5.7

* [Bug] Actually fixes issue when building criteria with dates instead of causing more issues. See [#79](https://github.com/balderdashy/waterline-sequel/pull/79) for more.

### 0.5.6

* [STABILITY] Locks lodash dependency to a known version

* [BUG] Fixes issue when building criteria with dates that are strings. See [#77](https://github.com/balderdashy/waterline-sequel/pull/77) for more details.

### 0.5.5

* [BUG] Fixes issue when searching for NULL values and using parameterized queries the index could get off. See [#63](https://github.com/balderdashy/waterline-sequel/issues/63) for more.
