# Success

Success is a service for incrementing integers

## Configuration

* `port` (d: 8080) - Set the port
* `host` (d: 127.0.0.1) - Set the host
* `incrementers`
	* `path` (required) - The path to store the incrementer at
	* `jump` (d: 1) - Set the amount to jump between integers
	* `reserve` (d: 100) - The amount of IDs to hold onto in memory.  A higher number will
		cause less writing.  A lower number will cause more writing but waste
		less keyspace in the event of a failure.

## TODO

* Be able to set a size of when async should refill (before limit is hit)
