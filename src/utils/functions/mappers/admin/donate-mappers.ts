import {
    UahBankDetailsDto,
    ForeignBankDetailsDto,
    CorrespondentBankDetailsDto,
    CreateUahBankDetails,
    UpdateUahBankDetails,
    CreateForeignBankDetails,
    UpdateForeignBankDetails,
    CreateCorrespondentBankDetails,
    UpdateCorrespondentBankDetails,
} from '../../../../types/admin/donate';

// UAH Bank Details Mappers
export function mapToCreateUahBankDetails(dto: UahBankDetailsDto): CreateUahBankDetails {
    const { id, ...createData } = dto;
    return createData;
}

export function mapToUpdateUahBankDetails(dto: UahBankDetailsDto): UpdateUahBankDetails {
    const { id, ...updateData } = dto;
    return updateData;
}

// Foreign Bank Details Mappers
export function mapToCreateForeignBankDetails(dto: ForeignBankDetailsDto): CreateForeignBankDetails {
    const { id, correspondentBanks, ...createData } = dto;
    return createData;
}

export function mapToUpdateForeignBankDetails(dto: ForeignBankDetailsDto): UpdateForeignBankDetails {
    const { id, correspondentBanks, currency, ...updateData } = dto;
    return updateData;
}

// Correspondent Bank Details Mappers
export function mapToCreateCorrespondentBankDetails(
    dto: CorrespondentBankDetailsDto,
    foreignBankDetailsId: number,
): CreateCorrespondentBankDetails {
    const { id, ...createData } = dto;
    return {
        ...createData,
        foreignBankDetailsId,
    };
}

export function mapToUpdateCorrespondentBankDetails(dto: CorrespondentBankDetailsDto): UpdateCorrespondentBankDetails {
    const { id, foreignBankDetailsId, ...updateData } = dto;
    return updateData;
}
