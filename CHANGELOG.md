# Waterline-Sequel Changelog

### 0.6.4

* [ENHANCEMENT] Update any outdated dependencies that may have been causing warnings on install.

* [BUG] Fixes issued where `[undefined]` was being used to select invalid custom primary keys in certain situations.

* [BUG] Add a check to revert to `SELECT *` when the select array is empty to prevent the case where the query gets built with `SELEC`.

* [BUG] Fix case where `attributes` was still being used instead of `definition`.

### 0.6.3

* [ENHANCEMENT] Added newer versions of Node to the Travis test runner.

* [BUG] Fix a bug from a previous commit. See [#91](https://github.com/balderdashy/waterline-sequel/pull/91) for more details. Thanks to [@acekat](https://github.com/acekat) for the patch.

* [STABILITY] Fix to prevent undefined keys from being used. See [95b0a080a9c5010d867a5dca80b7084501f8dad4](https://github.com/balderdashy/waterline-sequel/commit/95b0a080a9c5010d867a5dca80b7084501f8dad4) for more details.

* [BUG] Fix for unknown operators. See [#87](https://github.com/balderdashy/waterline-sequel/pull/87) for more details. Thanks to [@kevinburkeshyp](https://github.com/kevinburkeshyp) for the patch.

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
