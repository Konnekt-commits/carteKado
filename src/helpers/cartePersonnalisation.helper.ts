import ErrorHandler from "@/utils/ErrorHandler"

const colorPattern = /^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/
export const validateCartePersonnalisationData = (data: any) => {
    const { id_carte, id_modele, couleur_fond } = data
    if ( [id_carte, id_modele].some(el => el == null) ) {
        throw new ErrorHandler(`id_carte and id_modele state can not be nullable`, 400)
    }
    if (couleur_fond && !colorPattern.test(couleur_fond)) {
        throw new ErrorHandler('Invalid color format!', 400)
    }

}
