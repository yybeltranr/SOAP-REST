// wrapper-soap-to-rest.js

const express = require('express');
const soap = require('soap');
const bodyParser = require('body-parser'); // Parsear el cuerpo JSON de las solicitudes REST

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// URLSOAP externo
const soapWsdlUrl = 'http://www.dneonline.com/calculator.asmx?WSDL';
let soapClient;

soap.createClient(soapWsdlUrl, function(err, client) {
    if (err) {
        console.error('Error al crear el cliente SOAP:', err);
    } else {
        soapClient = client;
        console.log('Cliente SOAP inicializado correctamente.');
        console.log(soapClient.describe());
    }
});

app.post('/api/calculator/add', async (req, res) => {
    if (!soapClient) {
        return res.status(500).json({ error: 'Servicio SOAP no inicializado.' });
    }

    const { intA, intB } = req.body;

    if (typeof intA !== 'number' || typeof intB !== 'number') {
        return res.status(400).json({ error: 'intA y intB deben ser números.' });
    }

    // Mapear la solicitud REST a la solicitud SOAP
    const args = {
        intA: intA,
        intB: intB
    };

    try {
        const result = await soapClient.AddAsync(args);
        const sum = result[0].AddResult;

        res.json({
            operation: 'add',
            operand1: intA,
            operand2: intB,
            result: sum
        });
    } catch (error) {
        console.error('Error en la llamada SOAP (Add):', error.message);
        res.status(500).json({
            error: 'Error al realizar la operación de suma en el servicio SOAP.',
            details: error.message
        });
    }
});

app.post('/api/calculator/subtract', async (req, res) => {
    if (!soapClient) {
        return res.status(500).json({ error: 'Servicio SOAP no inicializado.' });
    }

    const { intA, intB } = req.body;

    if (typeof intA !== 'number' || typeof intB !== 'number') {
        return res.status(400).json({ error: 'intA y intB deben ser números.' });
    }

    const args = {
        intA: intA,
        intB: intB
    };

    try {
        const result = await soapClient.SubtractAsync(args);
        const difference = result[0].SubtractResult;

        res.json({
            operation: 'subtract',
            operand1: intA,
            operand2: intB,
            result: difference
        });
    } catch (error) {
        console.error('Error en la llamada SOAP (Subtract):', error.message);
        res.status(500).json({
            error: 'Error al realizar la operación de resta en el servicio SOAP.',
            details: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Wrapper SOAP a REST escuchando en http://localhost:${port}`);
    console.log(`Probar: POST http://localhost:${port}/api/calculator/add con {"intA": 5, "intB": 3}`);
});