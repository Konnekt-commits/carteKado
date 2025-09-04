import swaggerAutogen from 'swagger-autogen';


const doc = {
    info: {
        title: 'CarteKado Service API',
        description: 'Automatically generated Swagger docs',
        version: '1.0.0'
    },
    host: 'localhost:8000/api/v1',
    schemes: ['http'],
    tags: [
        {
            name: 'Users',
            description: 'User management and profile operations'
        },
        {
            name: 'Cartes',
            description: 'Carte management and inventory operations'
        },
        {
            name: 'Cartes Modele',
            description: 'Cartes Modele management and Cartes Modele operations'
        },
        {
            name: 'Client',
            description: 'Client management and Client operations'
        },
        {
            name: 'Email',
            description: 'Email management and Log or notification operations'
        },
        {
            name: 'Entreprises',
            description: 'Entreprises management and Entreprises operations'
        },
        {
            name: 'Invites',
            description: 'Invites management and invite operations'
        },
        {
            name: 'Ligne Produits',
            description: 'Carte management and send Kado operations'
        },
        {
            name: 'Produits',
            description: 'Product catalog and inventory management'
        }
    ]

}

const outputFile = './swagger-output.json'
const endpointsFiles = [
    './routes/*.ts',
    './controllers/*.ts'
]

swaggerAutogen()(outputFile, endpointsFiles, doc)
