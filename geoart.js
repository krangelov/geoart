function Point(x,y) {
	this.x = x;
	this.y = y;
}
Point.prototype.radius = 6;
Point.prototype.draw = function(ctx) {
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.fill();
}
Point.prototype.isHit = function (x,y) {
	return (Math.sqrt((this.x-x)**2+(this.y-y)**2) <= this.radius);
}

function Line(a,b) {
	this.a = a;
	this.b = b;
}
Line.prototype.draw = function(ctx) {
	ctx.beginPath();				
	var y = (this.a.y*this.b.x - this.b.y*this.a.x)/(this.b.x-this.a.x);
	ctx.moveTo(0, y);
	var y = (this.a.y*(this.b.x-ctx.canvas.width) + this.b.y*(ctx.canvas.width-this.a.x))/(this.b.x-this.a.x);
	ctx.lineTo(ctx.canvas.width, y);
	ctx.closePath();
	ctx.stroke();
}
Line.prototype.intersect = function(that) {
	return that.intersectLine(this);
}
Line.prototype.intersectLine = function(that) {
	return new Point
	 (((this.a.x*this.b.y - this.a.y*this.b.x)*(that.a.x-that.b.x) - (this.a.x-this.b.x)*(that.a.x*that.b.y - that.a.y*that.b.x))/((this.a.x-this.b.x)*(that.a.y-that.b.y) - (this.a.y-this.b.y)*(that.a.x-that.b.x))
	 ,((this.a.x*this.b.y - this.a.y*this.b.x)*(that.a.y-that.b.y) - (this.a.y-this.b.y)*(that.a.x*that.b.y - that.a.y*that.b.x))/((this.a.x-this.b.x)*(that.a.y-that.b.y) - (this.a.y-this.b.y)*(that.a.x-that.b.x))
	 );
}
Line.prototype.intersectCircle = function(that) {
	var a  = (this.b.x - this.a.x)**2 + (this.b.y - this.a.y)**2;
	var b  = (this.a.x - that.c.x)*(this.a.x-this.b.x) + (this.a.y-that.c.y)*(this.a.y-this.b.y);
	var c  = (this.a.x - that.c.x)**2 + (this.a.y - that.c.y)**2;
	var r2 = (that.c.x - that.d.x)**2 + (that.c.y - that.d.y)**2;
	var l1 = (b + Math.sqrt(b**2 - a*(c-r2)))/a;
	var l2 = (b - Math.sqrt(b**2 - a*(c-r2)))/a;
	return [new Point(this.a.x*(1-l1)+this.b.x*l1,this.a.y*(1-l1)+this.b.y*l1)
		   ,new Point(this.a.x*(1-l2)+this.b.x*l2,this.a.y*(1-l2)+this.b.y*l2)
		   ]
}

function Circle(c,d) {
	this.c = c;
	this.d = d;
}
Circle.prototype.draw = function(ctx) {
	ctx.beginPath();
	var r = Math.sqrt((this.c.x-this.d.x)**2 + (this.c.y-this.d.y)**2);
	ctx.arc(this.c.x, this.c.y, r, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.stroke();
}
Circle.prototype.intersect = function(that) {
	return that.intersectCircle(this);
}
Circle.prototype.intersectLine = function(that) {
	var a  = (that.b.x - that.a.x)**2 + (that.b.y - that.a.y)**2;
	var b  = (that.a.x - this.c.x)*(that.a.x-that.b.x) + (that.a.y-this.c.y)*(that.a.y-that.b.y);
	var c  = (that.a.x - this.c.x)**2 + (that.a.y - this.c.y)**2;
	var r2 = (this.c.x - this.d.x)**2 + (this.c.y - this.d.y)**2;
	var l1 = (b + Math.sqrt(b**2 - a*(c-r2)))/a;
	var l2 = (b - Math.sqrt(b**2 - a*(c-r2)))/a;
	return [new Point(that.a.x*(1-l1)+that.b.x*l1,that.a.y*(1-l1)+that.b.y*l1)
		   ,new Point(that.a.x*(1-l2)+that.b.x*l2,that.a.y*(1-l2)+that.b.y*l2)
		   ]
}
Circle.prototype.intersectCircle = function(that) {
	var r2 = (this.c.x-this.d.x)**2 + (this.c.y-this.d.y)**2;
	var R2 = (that.c.x-that.d.x)**2 + (that.c.y-that.d.y)**2;
	var d  = Math.sqrt((this.c.x-that.c.x)**2 + (this.c.y-that.c.y)**2);
	var a  = (r2 - R2 + d*d)/(2*d);
	var h  = Math.sqrt(r2 - a*a);
	var x  = this.c.x + (that.c.x-this.c.x)*(a/d);
	var y  = this.c.y + (that.c.y-this.c.y)*(a/d);

	return [new Point(x + h*(that.c.y - this.c.y)/d, y - h*(that.c.x - this.c.x)/d)
		   ,new Point(x - h*(that.c.y - this.c.y)/d, y + h*(that.c.x - this.c.x)/d)]
}

function Arc(c,d,p) {
	Circle.call(this,c,d);
	this.p = p;
}
Arc.prototype = Object.create(Circle.prototype);
Arc.prototype.draw = function(ctx) {
	ctx.beginPath();
	var r = Math.sqrt((this.c.x-this.d.x)**2 + (this.c.y-this.d.y)**2);
	var a1 = Math.asin((this.p.y-this.c.y)/r);
	if (this.c.x > this.p.x) a1 = Math.PI-a1;
	var a2 = 2*Math.PI-Math.asin((this.c.y-this.d.y)/r);
	if (this.c.x > this.d.x) a2 = Math.PI-a2;
	ctx.arc(this.c.x, this.c.y, r, a1, a2);
	ctx.stroke();
}
