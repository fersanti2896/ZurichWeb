export interface GetPolicysRequest {
    startDate?: string | null;
    endDate?: string | null;
    policyTypeId?: number | null;
    policyStatusId?: number | null;
}

export interface PolicyDTO {
    policyId: number;
    clientId: number;
    fullName: string;
    policyTypeId: number;
    policyName: string;
    policyStatusId: number;
    statusName: string;
    startDate: string;
    endDate: string;
    insuredAmount: number;
}

export interface PolicyTypesDTO {
    policyTypeId: number;
    name: string;
}

export interface PolicyStatusesDTO {
    policyStatusId: number;
    name: string;
}

export interface CreatePolicyRequest {
    clientId: number;
    policyTypeId: number;
    startDate: string;
    endDate: string;
    insuredAmount: number;
}

export interface CancelPolicyRequest {
    policyId: number;
}

