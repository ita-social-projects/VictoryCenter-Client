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

export function mapToCreateUahBankDetails(dto: UahBankDetailsDto): CreateUahBankDetails {
    const { id: _id, ...createData } = dto;
    return createData;
}

export function mapToUpdateUahBankDetails(dto: UahBankDetailsDto): UpdateUahBankDetails {
    const { id: _id, ...updateData } = dto;
    return updateData;
}

export function mapToCreateForeignBankDetails(dto: ForeignBankDetailsDto): CreateForeignBankDetails {
    const { id: _id, correspondentBanks: _correspondentBanks, ...createData } = dto;
    return createData;
}

export function mapToUpdateForeignBankDetails(dto: ForeignBankDetailsDto): UpdateForeignBankDetails {
    const { id: _id, correspondentBanks: _correspondentBanks, currency: _currency, ...updateData } = dto;
    return updateData;
}

export function mapToCreateCorrespondentBankDetails(
    dto: CorrespondentBankDetailsDto,
    foreignBankDetailsId: number,
): CreateCorrespondentBankDetails {
    const { id: _id, ...createData } = dto;
    return {
        ...createData,
        foreignBankDetailsId,
    };
}

export function mapToUpdateCorrespondentBankDetails(dto: CorrespondentBankDetailsDto): UpdateCorrespondentBankDetails {
    const { id: _id, foreignBankDetailsId: _foreignBankDetailsId, ...updateData } = dto;
    return updateData;
}
