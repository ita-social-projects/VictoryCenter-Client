const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;

export const getYouTubeVideoId = (link: string | null | undefined): string | null => {
    if (!link) return null;

    let url: URL;
    try {
        url = new URL(link);
    } catch {
        return null;
    }

    const host = url.hostname.replace(/^(www\.|m\.)/, '');
    let id: string | null = null;

    if (host === 'youtu.be') {
        id = url.pathname.split('/')[1] ?? null;
    } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        const [, section, segment] = url.pathname.split('/');
        if (section === 'watch') {
            id = url.searchParams.get('v');
        } else if (['shorts', 'embed', 'live'].includes(section)) {
            id = segment;
        }
    }

    return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
};

export const getVideoThumbnailUrl = (link: string | null | undefined): string | null => {
    const youTubeId = getYouTubeVideoId(link);
    return youTubeId ? `https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg` : null;
};
