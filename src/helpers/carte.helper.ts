import ErrorHandler from "@/utils/ErrorHandler"

const colorPattern = /^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/
const emailRegexPatten = /^((?:[A-Za-z0-9!#$%&'*+\-/=?^_`{|}~]|(?<=^|\.)"|"(?=$|\.|@)|(?<=".)[ .](?=.*")|(?<!\.)\.){1,64})(@)([A-Za-z0-9.-]*[A-Za-z0-9]\.[A-Za-z0-9]{2,})$/

export const validateCarteKadoData = (data: any) => {
    const { couleur, expire, invite, client, montant_initial, produits} = data

    if (couleur && !colorPattern.test(couleur)) {
        throw new ErrorHandler('Invalid color format!', 400)
    }
    if (expire && expire >= 365) {
        throw new ErrorHandler('expires days cannot be greeter than 365', 400)
    }
    if (invite && !emailRegexPatten.test(invite.email)) {
        throw new ErrorHandler('Invalid invite email format!', 400)
    }
    if (client && !emailRegexPatten.test(client.email)) {
        throw new ErrorHandler('Invalid invite email format!', 400)
    }
    if (montant_initial && montant_initial < 0) {
        throw new ErrorHandler('Invalid montant_initial: montant_initial cannot be less than or equal to zero', 400)
    }
    if (montant_initial && produits) {
        throw new ErrorHandler(' carte cannot be a double type: provide just product or value carte', 400)
    }
    if (produits && (!Array.isArray(produits) || produits.length <= 0)) {
        throw new ErrorHandler('please provide list of array', 400)
    }
    // if (!passwordRegexPatten.test(hash_mot_de_passe)) {
    //     throw new ErrorHandler('Invalid password format!', 400)
    // }montant_initial
    // produits
}
