module.exports = {

    // Network related
    url: 'ws://127.0.0.1:8080/ws',
    interval: 30,

    // Game related
    radiusInit: 350,
    radiusDecreasePerTerm: 0.4,
    heroInit: {
        x: 0,
        y: 250,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        fx: 0,
        fy: 0,
    },
    monsterInit: {
        x: 0,
        y: -250,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        fx: 0,
        fy: 0,
    },

    // Physical engine related
    unitTime: 0.016,
    maxForce: 1000,
    maxSpeed: 500,
};