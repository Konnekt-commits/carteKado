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
    ],
    definitions: {
        Client: {
            id_entreprise:"1",
            email:"test@email.fr",
            nom:"client_1",
            telephone:"96 96 96 96 96",
            Appartement:" ",
            code_postal:"96258",
            ville:"tunis",
            pays:"tunisie",
            adresse:"raoued nour-jafer"
        },
        Carte: {
            id_entreprise: 1,
            id_client: 1,
            id_invite: 1,
            id_user_createur: 2,
            code: "dfdsfs5246",
            type_valeur: "montant/panier_produits",
            montant_initial: 9658.25,
            montant_restant: 1500,
            couleur: "#F54927",
            date_emission: "9/20/2025, 9:10:47 AM",
            date_expiration: "9/20/2025, 9:10:47 AM",
            statut: "active"
        },
        CarteModel: {
            nom: "carte model 1",
            description: null,
            fond_couleur: "#FFFFFF",
            illustration: null,
            police: null,
            actif: 0
        },
        Personnalisation: {
            id_carte: 1,
            id_modele: 1,
            couleur_fond: "#F54927",
            illustration: "/path/to/image.png",
            message_perso: "my custom perso message",
            police: "police",
            autres_options_json: {},
        },
        Email: {
            id_carte: 1,
            dest_type: "client/invite",
            dest_email: "some.test@email.com",
            template_code: "my custom template",
            date_envoi: "9/20/2025, 9:10:47 AM",
            statut: "envoye/echec",
        },
        Entreprise: {
            raison_sociale: " raison social",
            siren: "my best siren",
            adresse_facturation: "22 paris, something",
            tva_intracom: "tva_intracom",
            email_facturation: "some.facturation@email.com"
        },
        Invite: {
            nom: "invite 1",
            email: "invite@email.com"
        },
        Ligne:{
            id_carte: 1,
            id_produit: 2,
            quantite: 10
        },
        Produit: {
            id_entreprise: 2,
            nom: 1,
            prix_ttc: 2000,
            actif: 0,
        }
    }

}

const outputFile = './swagger-output.json'
const endpointsFiles = [
    './routes/*.ts',
    './controllers/*.ts'
]

swaggerAutogen()(outputFile, endpointsFiles, doc)
