export const getTextLengthFromHtml = (html: string): number => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.querySelectorAll('script, style').forEach((el) => el.remove());
    const text = tempDiv.innerText || tempDiv.textContent || '';
    return text.replace(/\n/g, '').length;
};
