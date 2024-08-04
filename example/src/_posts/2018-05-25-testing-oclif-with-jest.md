---
layout: post
title: "Testing OCLIF apps with Jest"
---

A couple of weeks ago I spent sometime migrating [Beau](https://beaujs.com) from
commander to OCLIF. I really liked how every command in OCLIF is a stand alone
class, it just felt tidier. Migrating the CLI was a breeze and I had the whole
thing running in a couple of hours.

After I was done I decided I wanted to add some tests. I mostly cared about the
output so all I wanted to do was snapshot it and let Jest warn me if it changed
by accident. I mostly write tests to make rewriting things easier so snapshotting
covers about 95% of my testing.

OCLIF recommends you use mocha and fancy-test for testing apps which is fine but
since I was already using Jest I didn't want to add even more dependencies. The
test helpers OCLIF provides seem nice, they mostly handle stdout and stderr, and
http requests. These are handy but since I only cared about the output I figured
I wouldn't need them.

OCLIF makes testing super easy. Every command is a class and every class has a
static `run` method which you can use to, _you guessed it_, run the command. It
takes an array with the arguments the command would normally receive. Given that,
testing is made super easy.

Let's create a Test command that prints "test" and test that it does so.

Here's our test command:

```javascript
const { Command } = require('@oclif/command');

class TestCommand extends Command {
	async run() {
		console.log('Test');
	}
}

module.exports = TestCommand;
```

If the CLI was called `hello` and we ran `hello test` we'd get 'test' back. Let's
add a test to confirm we are getting the expected result back.

```javascript
describe('Test Command', () => {
	it('should print Test', async () => {
		let result = await TestCommand.run([]);
		expect(result).toBe('Test');
	});
});
```

This is cool, but wouldn't work. Unfortunately the output is written to the
STDOUT so that means that `run` doesn't actually return anything. Luckily for us
Jest has spies built-in so all it takes is to add a spy to that call:

```javascript
...
	it('should print Test', async () => {
		let spy = jest.spyOn(process.stdout, 'write');

		await TestCommand.run([]);
		expect(spy).toHaveBeenCalledWith('Test');
	});
...
```

To simplify this you can move the spy to a `beforeEach`.

```javascript
describe('Test Command', () => {
	let result;

	beforeEach(() => {
		result = [];
		jest
			.spyOn(process.stdout, 'write')
			.mockImplementation(val =>
				result.push(val)
			);
	});

	afterEach(() => jest.restoreAllMocks());

	it('should print Test', async () => {
		await TestCommand.run([]);
		expect(result).toContain('Test')
	});
});

```

Whenever `process.stdout.write` is called you push the value into the result array.
You can then check if the correct values are a part of the array. I'd just snapshot
it and call it the day though.

Remember that the array that run expects is supposed to be the argv for that command.
So they should be in the order they are expected and should all be strings.

Have fun testing your CLIs.
