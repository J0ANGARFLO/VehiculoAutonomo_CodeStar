var awsIot = require("aws-iot-device-sdk");

var express= require('express');
var app = express();

const JFrente = {motor11: '1', motor12: '0', motor21: '1', motor22: '0',
                motor31: '1', motor32: '0', motor41: '1', motor42: '0'};
const JAtras = {motor11: '0', motor12: '1', motor21: '0', motor22: '1',
                motor31: '0', motor32: '1', motor41: '0', motor42: '1'};
const JDerecha = { motor11: '0', motor12: '1', motor21: '0', motor22: '1', 
                motor31: '1', motor32: '0', motor41: '1', motor42: '0'};
const JIzquierda = { motor11: '1', motor12: '0', motor21: '1', motor22: '0', 
                motor31: '0', motor32: '1', motor41: '0', motor42: '1'};
const JDetener = { motor11: '0', motor12: '0', motor21: '0', motor22: '0', 
                motor31: '0', motor32: '0', motor41: '0', motor42: '0'};

// Constantes tiempos
const cincoMilSeg = 500;
const NoventaGrados = 100;
const CienTreintaGrados = 800;
const CienOchentaGrados = 1000;

app.listen(3010, function () {
    console.log('Example app listening on port 3010!');
});

var device = null;

/**
    Estructura de un Json para evitar obstaculos
    {
        obts:{
            Izq:1,
            FrentIzq:0,
            FrentDer:0,
            Der:1
        },
        JObts:true
    }
*/

/**
    Estructura de un Json para evitar Escaleras
    {
        precipicio: 0, // 0 o 1
        JInfraRojo:true
    }
*/

function publishToCar (messageIot,res, _callback){
    if (device == null){
        device =awsIot.device({
            keyPath:'fe239dfb6c-private.pem.key',
            certPath:'fe239dfb6c-certificate.pem.crt',
            caPath:'AmazonRootCA1.pem',
            clientId:'CosaServer',
            region:'us-east-2',
            host:'a1xnw6qqrbsg2y-ats.iot.us-east-2.amazonaws.com'
        });
                
                
        device.on('connect', function(){
            console.log('connected');
            console.log('connect');
            device.subscribe('PoliticaCosa');
            if (!res.headersSent)
            	device.publish('PoliticaCosa', JSON.stringify(messageIot));
            console.log('Message Sent..');
        });
    }
    else{
        device.removeListener('message', messageListener);
        device.publish('PoliticaCosa', JSON.stringify(messageIot));
    }
    messageListener = function (topic,payload) {
        console.log('message',topic,payload.toString());
        payload = JSON.parse(payload);
        console.log(payload.JObts);
        console.log(typeof payload.JObts !== "undefined" && payload.JObts==true);
        if(typeof payload.JObts !== "undefined" && payload.JObts==true)
            analisisObstaculos(payload.obts);
        _callback();
    };

    device.on('message', messageListener);
}

function girarIzquierda(res,_callback){
    if (res == null)
        res = {
            headersSent :false
        };
    publishToCar(JIzquierda,res,_callback);
}

function girarDerecha(res,_callback){
    if (res == null)
        res = {
            headersSent :false
        };
    publishToCar(JDerecha,res,_callback);
}

function moverFrente(res,_callback){
    if (res == null)
        res = {
            headersSent :false
        };
    publishToCar(JFrente,res,_callback);
}

function moverReversa(res,_callback){
    if (res == null)
        res = {
            headersSent :false
        };
    publishToCar(JAtras,res,_callback);
}

function detener(res,_callback){
    if (res == null)
        res = {
            headersSent :false
        };
    publishToCar(JDetener,res,_callback);
}

// ************ Movimiento Autonomo ***********************
// Movimeinto 1
function obstaculoIzqTDerTFre (){
    girarIzquierda(null, function () {
        setTimeout(function(){
            moverFrente(null, function () {
                setTimeout(function(){
                    girarDerecha(null, function () {
                        setTimeout(function(){
                            moverFrente(null, function () {})
                        }, NoventaGrados);
                    })
                }, cincoMilSeg);
            })
        }, NoventaGrados);
    })
}
// Movimeinto 2
function obstaculoIzqTFre (){
    girarIzquierda(null, function () {
        setTimeout(function(){
            moverFrente(null, function () {})
        }, NoventaGrados);
    })
}
// Movimeinto 3
function obstaculoDerTFre (){
    girarDerecha(null, function () {
        setTimeout(function(){
            moverFrente(null, function () {})
        }, NoventaGrados);
    })
}
// Movimeinto 4
function obstaculoDerTIzqTFre (){
    girarDerecha(null, function () {
        setTimeout(function(){
            girarIzquierda(null, function () {
                setTimeout(function(){
                    moverFrente(null, function () {})
                }, NoventaGrados);
            })
        }, NoventaGrados);
    })
}
// Movimeinto 5
function obstaculoFre (){
    moverFrente(null, function () {})
}
// Movimeinto 6
function obstaculoAtrTIzqTFre (){
    moverReversa(null, function () {
        setTimeout(function(){
            girarIzquierda(null, function () {
                setTimeout(function(){
                    moverFrente(null, function () {})
                }, CienOchentaGrados);
            })
        }, NoventaGrados);
    })
}
// Movimeinto 7
function obstaculoIzqTOchcoFre (){
    girarIzquierda(null, function () {
        setTimeout(function(){
            moverFrente(null, function () {})
        }, CienTreintaGrados);
    })
}
// Movimeinto 8
function obstaculoDerTOchoFre (){
    girarDerecha(null, function () {
        setTimeout(function(){
            moverFrente(null, function () {})
        }, CienTreintaGrados);
    })
}

function analisisObstaculos (Jobstaculos){
    const sIzq = Jobstaculos['Izq'];
    const sFrentIzq = Jobstaculos['FrentIzq'];
    const sFrentDer = Jobstaculos['FrentDer'];
    const sDer = Jobstaculos['Der'];
    switch (true){
        case sIzq==0 &&  sFrentIzq==0 && sFrentDer==0 &&  sDer==1:
            obstaculoIzqTDerTFre(); // Movimiento 1
            break;
        case sIzq==0 &&  sFrentIzq==0 && sFrentDer==1 &&  sDer==0:
            obstaculoIzqTFre(); // Movimiento 2
            break;
        case sIzq==0 &&  sFrentIzq==1 && sFrentDer==0 &&  sDer==0:
            obstaculoIzqTFre(); // Movimiento 3
            break;
        case sIzq==1 &&  sFrentIzq==0 && sFrentDer==0 &&  sDer==0:
            obstaculoDerTIzqTFre(); // Movimiento 4
            break;
        case sIzq==0 &&  sFrentIzq==0 && sFrentDer==1 &&  sDer==1:
            obstaculoIzqTFre(); // Movimiento 2
            break;
        case sIzq==0 &&  sFrentIzq==1 && sFrentDer==0 &&  sDer==1:
            obstaculoIzqTFre(); // Movimiento 2
            break;
        case sIzq==1 &&  sFrentIzq==0 && sFrentDer==0 &&  sDer==1:
            obstaculoFre(); // Movimiento 5
            break;
        case sIzq==1 &&  sFrentIzq==0 && sFrentDer==1 &&  sDer==0:
            obstaculoIzqTFre(); // Movimiento 3
            break;
        case sIzq==1 &&  sFrentIzq==1 && sFrentDer==0 &&  sDer==0:
            obstaculoIzqTFre(); // Movimiento 3
            break;
        case sIzq==0 &&  sFrentIzq==1 && sFrentDer==1 &&  sDer==0:
            obstaculoAtrTIzqTFre(); // Movimiento 6
            break;
        case sIzq==0 &&  sFrentIzq==1 && sFrentDer==1 &&  sDer==1:
            obstaculoIzqTOchcoFre(); // Movimiento 7
            break;
        case sIzq==1 &&  sFrentIzq==0 && sFrentDer==1 &&  sDer==1:
            obstaculoAtrTIzqTFre(); // Movimiento 6
            break;
        case sIzq==1 &&  sFrentIzq==1 && sFrentDer==0 &&  sDer==1:
            obstaculoAtrTIzqTFre(); // Movimiento 6
            break;
        case sIzq==1 &&  sFrentIzq==1 && sFrentDer==1 &&  sDer==1:
            obstaculoAtrTIzqTFre(); // Movimiento 6
            break;
        case sIzq==1 &&  sFrentIzq==1 && sFrentDer==1 &&  sDer==0:
            obstaculoDerTOchoFre(); // Movimiento 8
            break;
    }
    
}

// *************************************************

app.get('/', function(req, res){
    obstaculoIzqTDerTFre()
    res.send({
        "Output":"Hello get World"
    });
});

app.post('/', function(req, res){
    res.send({
        "Output":"Hello postWorld"
    });
});

app.get('/startEngine', function(req, res){
    const startEngine = req.query.startEngine;

    switch (startEngine) {
        case 'true':
            publishToCar({
                state: 1,
                message: "Vehículo encendido"
            },res, function(){
            	if(!res.headersSent)
		            res.status(200).send({
		                state: 1,
		                message: "Vehículo encendido"
		            });
            });
            break;
        case 'false':
            publishToCar({
                state: 0,
                message: "Vehículo apagado"
            },res, function(){
            	if(!res.headersSent)
		            res.status(200).send({
		                state: 0,
		                message: "Vehículo apagado"
		            });
            });
            break;
        default:
            res.status(400).send({
                state: "null",
                message: "No se envió solicitud al vehículo"
            })
            break;
    }
});

app.get('/movimientoAuto', function(req, res){
    const drive = req.query.drive;
    
    switch (drive) {
        case 'frente':
            moverFrente(res, function(){
            	if(!res.headersSent)
		            res.status(200).send(JFrente);
            });
            break;
        case 'atras':
            moverReversa(res, function(){
            	if(!res.headersSent)
		            res.status(200).send(JAtras);
            });
            break;
        case 'derecha':
            girarDerecha(res, function(){
            	if(!res.headersSent)
		            res.status(200).send(JDerecha);
            });
            break;
        case 'izquierda':
            girarIzquierda(res, function(){
            	if(!res.headersSent)
		            res.status(200).send(JIzquierda);
            });
            break;
        case 'detener':
            detener(res, function(){
            	if(!res.headersSent)
		            res.status(200).send(JDetener);
            });
            break;
        default:
            res.status(400).send({
                state: "null",
                message: "No se envió solicitud al vehículo"
            });
            break;
    }
});

module.exports = app;