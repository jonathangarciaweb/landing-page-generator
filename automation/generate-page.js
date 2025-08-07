// generate-page.js
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// URL de tu backend de Express desplegado en Render.
const API_URL = 'https://landing-page-api-cftl.onrender.com/api/productos';

// Función para generar y guardar el archivo HTML
async function generateLandingPage() {
    console.log('Iniciando la generación de la landing page...');
    let products = [];
    let errorMessage = '';

    // --- Paso 1: Asegúrate de que el directorio 'dist' existe ---
    // Este código se ejecuta siempre, garantizando que Netlify siempre encuentre el directorio.
    const outputDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
        // 2. Obtener los datos de los productos desde tu API de Express
        console.log('Obteniendo datos de productos desde la API...');
        const response = await fetch(API_URL);

        if (!response.ok) {
            // Si la API falla, lanzamos un error que capturaremos
            errorMessage = `Error en la respuesta de la API: ${response.statusText}`;
            throw new Error(errorMessage);
        }
        
        products = await response.json();
        console.log(`Datos de ${products.length} productos obtenidos.`);

    } catch (error) {
        // En caso de que la API falle, se capturará aquí el error real
        errorMessage = `🚨 Error al obtener datos de la API: ${error.message}`;
        console.error(errorMessage);
    }
    
    // 3. Construir el HTML de las tarjetas dinámicamente
    // Se genera el contenido incluso si no hay productos (o si la API falló)
    const cardsHtml = products.length > 0 ? products.map(product => `
        <div class="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col transform hover:-translate-y-1">
            <div class="relative">
                <img src="${product.imageUrl}" alt="${product.title}" class="w-full h-48 object-cover" />
                <div class="absolute top-0 right-0 m-2 p-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    Nuevo
                </div>
            </div>
            <div class="p-6 flex-1 flex flex-col">
                <h3 class="text-2xl font-bold text-gray-900 mb-2">${product.title}</h3>
                <p class="text-gray-600 text-sm flex-1 mb-4">${product.summary}</p>
                <div class="mt-auto space-y-2">
                    <a href="${product.whatsappLink}" target="_blank" rel="noopener noreferrer" class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                        <span class="mr-2">Chat por WhatsApp</span>
                        <!-- SVG del ícono de WhatsApp -->
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 448 512" fill="currentColor">
                            <path d="M380.9 97.1C339.6 55.8 281.2 32 224 32S108.4 55.8 67.1 97.1C25.8 138.4 2.1 196.8 2.1 254.5c0 55.8 23.7 114.2 65 155.5l-.2 .2-27.1 99.8c-2.3 8.3 0 17.5 5.8 24.3 5.8 6.8 15.6 9.8 24.3 7.5l99.8-27.1 155.5 65.1c54.1 22.7 111.4-23.7 101.1-79.3l-27.1-99.8c55.8-23.7 99.5-67.4 99.5-125.1 0-55.8-23.7-114.2-65-155.5zM358.3 381.1l-27.1 99.8c-1.3 4.8-5.3 8-10.1 8-4.8 0-8.8-3.2-10.1-8l-27.1-99.8-155.5-65.1c-4.8-1.3-8-5.3-8-10.1s3.2-8.8 8-10.1l155.5-65.1 27.1-99.8c1.3-4.8 5.3-8 10.1-8 4.8 0 8.8 3.2 10.1 8l27.1 99.8 65.1 155.5c1.3 4.8-3.2 10.1-8 10.1l-99.8 27.1zM315.6 340.5c-22.1 9.3-45.7 14.1-69.6 14.1-13.8 0-27.4-1.7-40.8-5.1-4.8-1.3-9.1 1.6-10.4 6.4-1.3 4.8 1.6 9.1 6.4 10.4 17.3 4.4 35.2 6.5 53.4 6.5 24.8 0 49.3-4.8 72.3-14.1 4.8-1.3 9.1 1.6 10.4 6.4 1.3 4.8-1.6 9.1-6.4 10.4z"/>
                        </svg>
                    </a>
                    <a href="${product.mercadoLibreUrl}" target="_blank" rel="noopener noreferrer" class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                        Ver en MercadoLibre
                    </a>
                </div>
            </div>
        </div>
    `).join('') : `
        <div class="col-span-full text-center p-12 bg-white rounded-xl shadow-lg">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">No se encontraron productos.</h2>
            <p class="text-gray-600">${errorMessage || 'Intenta de nuevo más tarde.'}</p>
        </div>
    `;

    // 4. Crear el HTML completo de la página
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nuestros Productos</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                }
            </style>
        </head>
        <body class="bg-gray-100 p-8">
            <div class="max-w-7xl mx-auto">
                <header class="text-center mb-12">
                    <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
                        Nuestros Productos Destacados
                    </h1>
                    <p class="text-lg text-gray-600">
                        Descubre las últimas novedades y ofertas exclusivas que tenemos para ti.
                    </p>
                </header>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${cardsHtml}
                </div>
            </div>
        </body>
        </html>
    `;

    // 5. Guardar el archivo HTML
    const outputPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputPath, htmlContent, 'utf-8');

    console.log(`🎉 ¡Página de destino generada con éxito en ${outputPath}!`);
}

// Ejecuta el script
generateLandingPage();
