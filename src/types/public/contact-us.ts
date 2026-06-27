export interface SubmitContactUsFormDto {
    captchaResponseToken: string;
    fromName: string;
    fromEmail: string;
    subject: string;
    message: string;
}
