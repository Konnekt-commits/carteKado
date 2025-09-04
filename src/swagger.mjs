import swaggerAutogen from 'swagger-autogen';


const doc = {
    info: {
        title: 'CarteKado Service API',
        description: 'Automatically generated Swagger docs',
        version: '1.0.0'
    },
    host: 'localhost:8000/api/v1',
    schemes: ['http']
}

const outputFile = './swagger-output.json'
const endpointsFiles = [
    './routes/user.route.ts',
    './routes/produit.route.ts',
    './routes/ligneProduit.route.ts',
    './routes/invite.route.ts',
    './routes/entreprise.route.ts',
    './routes/email.route.ts',
    './routes/client.route.ts',
    './routes/carteModele.route.ts',
    './routes/carte.route.ts'
]

swaggerAutogen()(outputFile, endpointsFiles, doc)
