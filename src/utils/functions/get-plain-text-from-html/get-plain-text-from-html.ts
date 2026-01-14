export const getPlainTextFromHtml = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.querySelectorAll('script, style').forEach((el) => el.remove());
    return tempDiv.innerText || tempDiv.textContent || '';
};
