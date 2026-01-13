export const getTextLengthFromHtml = (html: string): number => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    // Remove script and style elements to prevent their content from being counted
    tempDiv.querySelectorAll('script, style').forEach((el) => el.remove());
    const text = tempDiv.innerText || tempDiv.textContent || '';
    return text.replace(/\n/g, '').length;
};
