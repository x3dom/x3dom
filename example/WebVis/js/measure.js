/**
 * Created by Timo on 11.10.13.
 */

var Measure = function()
{
    this.p1 = {x:0, y:0, z:0};
    this.p2 = {x:0, y:0, z:0};

    this.activePoint = this.p1;

    this.updatePoint = function(x, y, z)
    {
        this.activePoint.x = x;
        this.activePoint.y = y;
        this.activePoint.z = z;

        document.getElementById("line").setAttribute("point", this.p1.x + " " + this.p1.y + " " + this.p1.z + ", " +
            this.p2.x + " " + this.p2.y + " " + this.p2.z);
    };

    this.tooglePoint = function()
    {
        if (this.activePoint == this.p1)
        {
            this.activePoint = this.p2;
            document.getElementById("lineTrafo").setAttribute("render", "true");
        }
        else
        {
            this.activePoint = this.p1;
            document.getElementById("lineTrafo").setAttribute("render", "false");
        }
    };

    this.distance = function()
    {
        var vec = {x: (this.p1.x - this.p2.x),
            y: (this.p1.y - this.p2.y),
            z: (this.p1.z - this.p2.z)};


        return Math.sqrt( Math.pow(vec.x, 2) +
            Math.pow(vec.y, 2) +
            Math.pow(vec.z, 2) );
    };

    this.toString = function()
    {
        if (this.activePoint == this.p1)
        {
            return "P1: (" + this.p1.x.toFixed(3) + ", " + this.p1.y.toFixed(3) + ", " + this.p1.z.toFixed(3) + ")";
        }
        else
        {
            return "P1: (" + this.p1.x.toFixed(3) + ", " + this.p1.y.toFixed(3) + ", " + this.p1.z.toFixed(3) + ")<br>" +
                "P2: (" + this.p2.x.toFixed(3) + ", " + this.p2.y.toFixed(3) + ", " + this.p2.z.toFixed(3) + ")<br>" +
                "Distance: " + (this.distance() * 10).toFixed(3) + " cm";
        }
    }
};
