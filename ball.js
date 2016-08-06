var config = require('./config.js');



// Define self used function
function floorEPS(lf) {
    return Math.floor(lf*1000) / 1000;
}
function dot(v1, v2) {
    return v1[0]*v2[0] + v1[1]*v2[1];
}
function vectorLength(v) {
    return Math.sqrt(dot(v, v));
}
function friction(v, k) {
    k = k || 1;
    return [-v[0]*k, -v[1]*k];
}



// Define ball class
var Ball = function(initValue) {
    this.init(initValue || {});
};

Ball.prototype.init = function(initValue) {
    initValue = initValue || {};
    this.x = initValue.x || 0;
    this.y = initValue.y || 0;
    this.vx = initValue.vx || 0;
    this.vy = initValue.vy || 0;
    this.ax = initValue.ax || 0;
    this.ay = initValue.ay || 0;
    this.fx = initValue.fx || 0;
    this.fy = initValue.fy || 0;
};

Ball.prototype.applyForce = function(force) {
	if( typeof force !== 'object' )
		return;
	force[0] = force[0] || 0;
	force[1] = force[1] || 0;
    var len = vectorLength(force);
    if( len > config.maxForce ) {
        force[0] *= config.maxForce / len;
        force[1] *= config.maxForce / len;
    }
    this.fx = floorEPS(force[0] || this.fx);
    this.fy = floorEPS(force[1] || this.fy);
};

Ball.prototype.next = function() {
    this.x += (this.vx + this.ax * config.unitTime / 2) * config.unitTime;
    this.y += (this.vy + this.ay * config.unitTime / 2) * config.unitTime;

    this.vx = this.vx + this.ax * config.unitTime;
    this.vy = this.vy + this.ay * config.unitTime;
    var len = vectorLength([this.vx, this.vy]);
    if( len > config.maxSpeed ) {
        this.vx = this.vx * this.maxSpeed / len;
        this.vy = this.vy * this.maxSpeed / len;
    }

    var fr = friction([this.vx, this.vy], config.k);
    this.ax = this.fx + fr[0];
    this.ay = this.fy + fr[1];
};

Ball.prototype.norm = function() {
	this.x = parseInt(this.x, 10);
    this.y = parseInt(this.y, 10);
    this.vx = floorEPS(this.vx);
    this.vy = floorEPS(this.vy);
    this.ax = floorEPS(this.ax);
    this.ay = floorEPS(this.ay);
};

Ball.prototype.isCollisionWith = function(other) {
	var X = this.x - other.x;
    var Y = this.y - other.y;
    return X*X + Y*Y <= 2500;
};

Ball.prototype.distanceWith = function(other) {
	return vectorLength([this.x-other.x, this.y-other.y]);
};

Ball.prototype.distanceWithOrigin = function() {
	return vectorLength([this.x, this.y]);
};

Ball.prototype.procCollisionWith = function(other) {
    var base = [this.x-other.x, this.y-other.y];
    var p = vectorLength(base);
    base[0] /= p;
    base[1] /= p;
    var pA = dot([this.vx, this.vy], base);
    var pB = dot([other.vx, other.vy], base);
    var copA = [base[0]*pA, base[1]*pA];
    var copB = [base[0]*pB, base[1]*pB];
    this.vx += -copA[0] + copB[0];
    this.vy += -copA[1] + copB[1];
    other.vx += -copB[0] + copA[0];
    other.vy += -copB[1] + copA[1];
};



// Export
module.exports = Ball;
