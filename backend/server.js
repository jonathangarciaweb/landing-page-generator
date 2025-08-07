// server.js
const express = require('express');
const Airtable = require('airtable');
const cors = require('cors');

// Inicializa Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware para permitir CORS (fundamental para que tu frontend pueda hacer peticiones)
app.use(cors());
app.use(express.json());

// --- Configuración de Airtable ---
// Es crucial usar variables de entorno para las claves de API por seguridad.
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'Productos'; // Ajusta esto al nombre de tu tabla

// Asegúrate de que las claves de API existen
if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error('ERROR: Las variables de entorno AIRTABLE_API_KEY y AIRTABLE_BASE_ID no están definidas.');
    process.exit(1);
}

// Configura la conexión a Airtable
Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: AIRTABLE_API_KEY
});
const base = Airtable.base(AIRTABLE_BASE_ID);

// --- Ruta para obtener los productos ---
// Esta será la API que tu frontend de React o tu script de automatización llamará
app.get('/api/productos', async (req, res) => {
    console.log('Recibida petición para /api/productos');

    try {
        const records = await base(AIRTABLE_TABLE_NAME)
            .select({
                // Puedes agregar filtros, orden, etc. según tus necesidades
                // Por ejemplo: 'filterByFormula: "Status = \'Published\'"'
                view: 'Grid view' // El nombre de la vista en tu base de Airtable
            })
            .firstPage();

        // Mapea los registros de Airtable a un formato JSON más limpio
        const products = records.map(record => ({
            id: record.id,
            title: record.get('Titulo'),
            summary: record.get('Resumen'),
            // Asegúrate de que el campo de la imagen en Airtable devuelva una URL.
            // Uploadcare puede proporcionar esto.
            imageUrl: record.get('URL Imagen') ? record.get('URL Imagen')[0].url : null,
            mercadoLibreUrl: record.get('Enlace MercadoLibre'),
            whatsappLink: record.get('Enlace WhatsApp')
        }));

        console.log(`Productos encontrados: ${products.length}`);
        res.status(200).json(products);

    } catch (error) {
        console.error('Error al obtener datos de Airtable:', error);
        res.status(500).json({ error: 'No se pudo obtener los datos de los productos.' });
    }
});

// Ruta de bienvenida para verificar que el servidor está funcionando
app.get('/', (req, res) => {
    res.send('Servidor de Landing Page API está funcionando.');
});

// Inicia el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Exportar la aplicación para su uso en entornos de testing o como módulo
module.exports = app;
