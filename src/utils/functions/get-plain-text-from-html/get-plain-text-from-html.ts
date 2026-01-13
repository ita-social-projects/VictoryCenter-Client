export const getPlainTextFromHtml = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    // Remove script and style elements to prevent their content from being included
    tempDiv.querySelectorAll('script, style').forEach((el) => el.remove());
    return tempDiv.innerText || tempDiv.textContent || '';
};
