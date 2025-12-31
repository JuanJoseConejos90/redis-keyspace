export interface CustomerSession {
    customerSessionId: string
    channel: string
    personIdentificationType: string
    personIdentification: string
    name: string
    lastName: string
    secondLastName: string
    birthDate: string
    expiryDate: string
    gender: Gender
    civilStatus: CivilStatus
    codeMaritalStatus: number
    maritalStatus: string
    placeOfBirth: string
    bornCountry: BornCountry
    workplace: Workplace
    isIndependent: boolean
    ip: string
    ingressCurrency: number
    dateCreated: string
}

export interface Gender {
    code: string
    gender: string
}

export interface CivilStatus {
    codeMaritalStatus: number
    MaritalStatus: string
}

export interface BornCountry {
    codeBornCountry: number
    bornCountry: string
}

export interface Workplace {
    codCountry: number
    place: string
}
