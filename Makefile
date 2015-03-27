
test: test-unit test-integration

test-unit:
	@NODE_ENV=test ./node_modules/.bin/mocha test/unit test/queries --recursive
  
test-integration:
	@NODE_ENV=test node test/integration/runnerDispatcher.js