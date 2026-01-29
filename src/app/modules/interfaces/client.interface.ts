
export interface GetClientsRequest {
    name?: string | null;
    email?: string | null;
    identificationNumber?: string | null;
}

export interface ClientDTO {
    clientId: number;
    fullName: string;
    identificationNumber: number;
    address?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
    cve_CodigoPostal: string;
    cve_Estado: string;
    cve_Municipio: string;
    cve_Colonia: string;
    street: string;
    extNbr: string;
    innerNbr: string;
    status: number;
}

export interface CreateClientRequest {
    firstName: string;
    lastName: string;
    mLastName?: string | null;
    email: string;
    password: string;
    phone: string;

    cve_CodigoPostal: string;
    cve_Estado: string;
    cve_Municipio: string;
    cve_Colonia: string;

    street: string;
    extNbr: string;
    innerNbr?: string | null;
}

export interface UpdateClientRequest {
    clientId: number;

    firstName: string;
    lastName: string;
    mLastName?: string | null;
    password?: string | null;

    phone: string;
    cve_CodigoPostal: string;
    cve_Estado: string;
    cve_Municipio: string;
    cve_Colonia: string;
    street: string;
    extNbr: string;
    innerNbr?: string | null;
}

export interface UpdateMyProfileRequest {
    phone: string;
    cve_CodigoPostal: string;
    cve_Estado: string;
    cve_Municipio: string;
    cve_Colonia: string;
    street: string;
    extNbr: string;
    innerNbr?: string | null;
}
