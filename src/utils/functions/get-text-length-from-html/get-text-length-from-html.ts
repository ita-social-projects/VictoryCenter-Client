export const getTextLengthFromHtml = (html: string): number => {
    if (!html) return 0;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    tempDiv.querySelectorAll('script, style').forEach((el) => el.remove());

    const text = tempDiv.innerText || tempDiv.textContent || '';
    return text.replace(/\n/g, '').length;
};
