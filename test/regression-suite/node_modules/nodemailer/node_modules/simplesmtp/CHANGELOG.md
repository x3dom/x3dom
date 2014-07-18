# CHANGELOG

## v0.3.27 2014-04-23

  * Bumped version to 0.3.27
  * get tests running in node 0.8, 0.10, 0.11 [9b3f9043..833388d5]

## v0.3.26 2014-04-23

  * Bumped version to 0.3.26
  * Server: Added support for XOAUTH2 authentication [87b6ed66]
  * Client: Use interval NOOPing to keep the connection up [184d8623]
  * Client: do not throw if recipients are note set [785a2b09]

## v0.3.25 2014-04-16

  * Bumped version to 0.3.25
  * disabled server test for max incoming connections [476f8cf5]
  * Added socketTimeout option [b83a4838]
  * fix invalid tests [cf22d390]

## v0.3.24 2014-03-31

  * Bumped version to 0.3.24
  * Added test for empty MAIL FROM [7f17174d]
  * Allow null return sender in mail command (coxeh) [08bc6a6f]
  * incorrect mail format fix (siterra) [d42d364e]
  * support for `form` and `to` structure: {address:"...",name:"..."} siterra) [2b054740]
  * Improved auth supports detection (finian) [863dc019]
  * Fixed a Buffer building bug (finian) [6dc9a4e2]

## v0.3.23 2014-03-10

  * Bumped version to 0.3.23
  * removed pipelining [4f0a382f]
  * Rename disableDotEscaping to enableDotEscaping [5534bd85]
  * Ignore OAuth2 errors from destroyed connections (SLaks) [e8ff3356]

## v0.3.22 2014-02-16

  * Bumped version to 0.3.22
  * Emit error on unexpected close [111da167]
  * Allowed persistence of custom properties when resetting envelope state. (garbetjie) [b49b7ead]

## v0.3.21 2014-02-16

  * Bumped version to 0.3.21
  * Ignore OAuth errors from destroyed connections (SLaks) [d50a7571]

## v0.3.20 2014-01-28

  * Bumped version to 0.3.20
  * Re-emit 'drain' from tcp socket [5bfb1fcc]

## v0.3.19 2014-01-28

  * Bumped version to 0.3.19
  * Prefer setImmediate over nextTick if available [f53e2d44]
  * Server: Implemented "NOOP" command (codingphil) [707485c0]
  * Server: Allow SIZE with MAIL [3b404028]

## v0.3.18 2014-01-05

  * Bumped version to 0.3.18
  * Added limiting of max client connections (garbetjie) [bcd5c0b3]

## v0.3.17 2014-01-05

  * Bumped version to 0.3.17
  * Do not create a server instance with invalid socket (47d17420)
  * typo (chrisdew) [fe4df83f]
  * Only emit rcptFailed if there actually was an address that was rejected [4c75523f]

## v0.3.16 2013-12-02

  * Bumped version to 0.3.16
  * Expose simplesmtp version number [c2382203]
  * typo in SMTP (chrisdew) [6c39a8d7]
  * Fix typo in README.md (Meekohi) [597a25cb]

## v0.3.15 2013-11-15

  * Bumped version to 0.3.15
  * Fixed bugs in connection timeout implementation (finian) [1a25d5af]

## v0.3.14 2013-11-08

  * Bumped version to 0.3.14
  * fixed: typo causing connection.remoteAddress to be undefined (johnnyleung) 795fe81f
  * improvements to handling stage (mysz) 5a79e6a1
  * fixes TypeError: Cannot use 'in' operator to search for 'dsn' in undefined (mysz) 388d9b82
  * lost saving stage in "DATA" (mysz) de694f67
  * more info on smtp error (mysz) 42a4f964

## v0.3.13 2013-10-29

  * Bumped version to 0.3.13
  * Handling errors which close connection on or before EHLO (mysz) 03345d4d

## v0.3.12 2013-10-29

  * Bumped version to 0.3.12
  * Allow setting maxMessages to pool 5d185708

## v0.3.11 2013-10-22

  * Bumped version to 0.3.11
  * style update 2095d3a9
  * fix tests 17a3632f
  * DSN Support implemented. (irvinzz) d1e8ba29

## v0.3.10 2013-09-09

  * Bumped version to 0.3.10
  * added greetingTimeout, connectionTimeout and rejectUnathorized options to connection pool 8fa55cd3

## v0.3.9 2013-09-09

  * Bumped version to 0.3.9
  * added "use strict" definitions, added new options for client: greetingTimeout, connectionTimeout, rejectUnathorized 51047ae0
  * Do not include localAddress in the options if it is unset 7eb0e8fc

## v0.3.8 2013-08-21

  * Bumped version to 0.3.8
  * short fix for #42, Client parser hangs on certain input (dannycoates) 089f5cd4

## v0.3.7 2013-08-16

  * Bumped version to 0.3.7
  * minor adjustments for better portability with browserify (whiteout-io) 15715498
  * Added raw message to error object (andremetzen) 15715498
  * Passing to error handler the message sent from SMTP server when an error occurred (andremetzen) 15d4cbb4

## v0.3.6 2013-08-06

  * Bumped version to 0.3.6
  * Added changelog
  * Timeout if greeting is not received after connection is established