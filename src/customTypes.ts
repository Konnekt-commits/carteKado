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
    MONTANT = 'montant',
PAN_PRODUITS = 'panier_produits'
}

export interface IMedia {
    public_id: string
    url: string
}

export type ImageType = 'png' | 'jpeg' | 'webp'

/**
 * Base64 encoded image string.
 * @template imageType - The type of the image.
 */
export type Base64<imageType extends ImageType> = `data:image/${imageType};base64,${string}`

/**
 * Result of the QR code generation.
 */
export interface QRResult {
    qr: Base64<ImageType>
    intent: string
}

/**
 * Parameters for generating carteKado intent.
 */
export interface CarteKadoIntentParams {
    id_carte: number;
    invite_email: string;
    client_email: string;
    montant_initial?: number;
    montant_restant?: number;
    carte_type?: string;
}
