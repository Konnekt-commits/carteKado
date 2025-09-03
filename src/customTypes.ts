export enum Roles {
    SUPER= 'super',
    ADMIN = 'admin',
    EMPLOYER = 'employe',
}

export enum TypeDestination {
    CLIENT= 'client',
    INVITE = 'invite',
}

export enum Status {
    ACTIVE='active',
    UTILISEE='utilisee',
    EXPIRES='expiree',
    ANNULES='annulee'

}
export enum StatusEmail {
    ENVOYER='envoye',
    ECHEC='echec'

}

export enum TypeValeur {
    MONTANT ='montant',
PAN_PRODUITS = 'panier_produits'
}

export interface IMedia {
    public_id: string
    url: string
}
