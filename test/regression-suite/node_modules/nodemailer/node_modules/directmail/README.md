# DirectMail

Sendmail alternative to send e-mails directly to recipients without a relaying service.

### Support DirectMail development

[![Donate to author](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=DB26KWR2BQX5W)

If you want to support with Bitcoins then my wallet address is `15Z8ADxhssKUiwP3jbbqJwA21744KMCfTM`

## Usage

### Setup

Require *directmail* object

    var createDirectmail = require("directmail"),
        directmail = createDirectmail(options);

Where

  * **options** is an optional options object with the following properties
    * *debug* - if set to true, prints all traffic to console
    * *name* - hostname to be used when introducing the client to the MX server

### Send mail

Push a message to the outgoing queue

    directmail.send({
        from: "sender@example.com",
        recipients: ["receiver1@example.com", "receiver2@example.com"],
        message: "Subject: test\r\n\r\nHello world!"
    });

Where

  * **from** (string) is the e-mail address of the sender
  * **recipients** (array) is an array of recipient e-mails. Put all `to`, `cc` and `bcc` addresses here.
  * **message** (string|buffer) is the RFC2822 message to be sent

### Check queue length

You can check the count of unsent messages from the `.length` property of the directmail object

    console.log(directmail.length); // nr of messages to be sent

If you try to send a message with multiple recipients then every unique recipient domain counts as a different message.

## Issues

*Directmail* is very inefficient as it queues all e-mails to be sent into memory. Additionally, if a message is not yet sent and the process is closed, all data about queued messages are lost. Thus *directmail* is only suitable for low throughput systems, like password remainders and such, where the message can be processed immediatelly. *Directmail* is not suitable for spamming.

While not being 100% reliable (remember - if process exits, entire queue is lost), *directmail* can still handle sending errors, graylisting and such. If a message can not be sent, it is requeued and retried later.

## License

**MIT**
