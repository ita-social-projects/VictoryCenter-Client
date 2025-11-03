import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { TeamMemberSearchItem } from './TeamMemberSearchItem';
import { SearchItemContentRef } from '../search-item-wrapper/SearchItemWrapper';
import { TeamCategory, TeamMember } from '../../../../types/admin/team-members';
import { VisibilityStatus } from '../../../../types/admin/common';

describe('TeamMemberSearchItem', () => {
    const categories: TeamCategory[] = [{ id: 1, name: 'Category A', description: '' }];

    const makeMember = (overrides: Partial<TeamMember> = {}): TeamMember => ({
        id: 1,
        fullName: 'John Doe',
        description: '',
        status: VisibilityStatus.Published,
        categoryId: 1,
        image: null,
        localizations: [],
        ...overrides,
    });

    it('renders initials from generateInitials utility when image is not provided', () => {
        render(
            <TeamMemberSearchItem
                ref={createRef<SearchItemContentRef>()}
                item={makeMember({ fullName: 'John Doe' })}
                isSearchItemActive={false}
                isSearchItemHovered={false}
                categories={categories}
            />,
        );

        expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders avatar image when image.url is provided', () => {
        const memberWithImage = makeMember({
            image: { id: 10, url: 'https://test/image.jpg', mimeType: 'image/jpeg' } as any,
        });

        render(
            <TeamMemberSearchItem
                ref={createRef<SearchItemContentRef>()}
                item={memberWithImage}
                isSearchItemActive={false}
                isSearchItemHovered={false}
                categories={categories}
            />,
        );

        expect(screen.getByAltText('')).toHaveAttribute('src', 'https://test/image.jpg');
    });

    it('getTooltipContent returns null when there is no overflow', () => {
        const ref = createRef<SearchItemContentRef>();

        render(
            <TeamMemberSearchItem
                ref={ref}
                item={makeMember()}
                isSearchItemActive={false}
                isSearchItemHovered={false}
                categories={categories}
            />,
        );

        expect(ref.current?.getTooltipContent()).toBeNull();
    });

    it('getTooltipContent returns tooltip node when overflow exists', () => {
        const ref = createRef<SearchItemContentRef>();

        render(
            <TeamMemberSearchItem
                ref={ref}
                item={makeMember({ fullName: 'VeryVeryVeryLongUserName ThatWillOverflow' })}
                isSearchItemActive={false}
                isSearchItemHovered={false}
                categories={categories}
            />,
        );

        const spyClient = jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(10);
        const spyScroll = jest.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(100);

        const tooltip = ref.current?.getTooltipContent();
        expect(tooltip).not.toBeNull();

        spyClient.mockRestore();
        spyScroll.mockRestore();
    });
});
