// wrapper-rest-to-soap.js

const express = require('express');
const soap = require('soap');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// URL del WSDL del servicio SOAP externo
const SOAP_WSDL_URL = 'http://www.dneonline.com/calculator.asmx?WSDL';

let soapClient;

app.use(bodyParser.json());

soap.createClient(SOAP_WSDL_URL, function(err, client) {
    if (err) {
        console.error('ERROR: No se pudo crear el cliente SOAP. Verifique la URL del WSDL o la conectividad.', err.message);
        process.exit(1);
    } else {
        soapClient = client;
        console.log('Cliente SOAP inicializado correctamente desde:', SOAP_WSDL_URL);
        console.log('Soap Describe:', soapClient.describe());
    }
});

app.post('/api/calculator/multiply', async (req, res) => {
    if (!soapClient) {
        return res.status(503).json({
            error: 'Servicio no disponible',
            message: 'El cliente SOAP no ha sido inicializado. Intente de nuevo más tarde.'
        });
    }

    const { intA, intB } = req.body;

    if (typeof intA !== 'number' || typeof intB !== 'number') {
        return res.status(400).json({
            error: 'Solicitud inválida',
            message: 'Los parámetros "intA" y "intB" son requeridos y deben ser números.',
            example: { intA: 5, intB: 10 }
        });
    }

    const soapArgs = {
        intA: intA,
        intB: intB
    };

    console.log(`Recibida solicitud REST para multiplicar: ${intA} * ${intB}`);

    try {
        const [result, rawResponse, soapHeader, rawRequest] = await soapClient.MultiplyAsync(soapArgs);

        const multiplicationResult = result.MultiplyResult;

        console.log(`Resultado de la operación SOAP (Multiply): ${multiplicationResult}`);

        res.json({
            status: 'success',
            operation: 'multiply',
            operand1: intA,
            operand2: intB,
            result: multiplicationResult
        });

    } catch (error) {
        console.error('ERROR al llamar al servicio SOAP (Multiply):', error.message);
        console.error('Detalles del error SOAP:', error.response?.status, error.response?.data);

        res.status(500).json({
            status: 'error',
            message: 'Hubo un problema al realizar la operación de multiplicación en el servicio SOAP.',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Wrapper REST a SOAP escuchando en http://localhost:${PORT}`);
    console.log(`Ejemplo de uso (POST): curl -X POST -H "Content-Type: application/json" -d '{"intA": 7, "intB": 8}' http://localhost:${PORT}/api/calculator/multiply`);
});