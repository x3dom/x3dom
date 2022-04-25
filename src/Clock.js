//Refer to three.js (https://threejs.org/docs/index.html#api/en/core/Clock)

x3dom.Clock = class Clock
{
    constructor ( autoStart = true )
    {
        this.autoStart = autoStart;

        this.startTime = 0;
        this.oldTime = 0;
        this.elapsedTime = 0;

        this.running = false;
    }

    start ()
    {
        this.startTime = Date.now();

        this.oldTime = this.startTime;
        this.elapsedTime = 0;
        this.running = true;
    }

    stop ()
    {
        this.getElapsedTime();
        this.running = false;
        this.autoStart = false;
    }

    getElapsedTime ()
    {
        this.getDelta();
        return this.elapsedTime;
    }

    getDelta ()
    {
        let diff = 0;

        if ( this.autoStart && ! this.running )
        {
            this.start();
            return 0;
        }

        if ( this.running )
        {
            const newTime = Date.now();

            diff = ( newTime - this.oldTime ) / 1000;
            this.oldTime = newTime;

            this.elapsedTime += diff;
        }

        return diff;
    }
};