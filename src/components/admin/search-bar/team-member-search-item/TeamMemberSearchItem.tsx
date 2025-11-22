import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { SearchItemContentRef, SearchItemContentRenderProps } from '../search-item-wrapper/SearchItemWrapper';
import { TeamMember } from '../../../../types/admin/team-members';
import { TeamCategory } from '../../../../types/admin/team-category';
import { generateInitials } from '../../../../utils/functions/formatters/text-formatters';
import styles from './TeamMemberSearchItem.module.scss';

export type TeamMemberSearchItemProps = SearchItemContentRenderProps<TeamMember> & {
    categories: TeamCategory[];
};

export const TeamMemberSearchItem = forwardRef<SearchItemContentRef, TeamMemberSearchItemProps>(
    ({ item, isSearchItemActive, isSearchItemHovered, categories }, ref) => {
        const nameRef = useRef<HTMLDivElement>(null);
        const subtitleRef = useRef<HTMLDivElement>(null);

        const { image } = item;

        const categoryName = useMemo(
            () => categories.find((c) => c.id === item.categoryId)?.name ?? '',
            [categories, item.categoryId],
        );

        const imageUrl = useMemo(() => {
            return image && 'url' in image ? image.url : null;
        }, [image]);

        const initials = useMemo(() => generateInitials(item.fullName), [item.fullName]);

        const getTooltipContent = () => {
            const nameOverflow = nameRef.current && nameRef.current.scrollWidth > nameRef.current.clientWidth;
            const subOverflow =
                subtitleRef.current && subtitleRef.current.scrollWidth > subtitleRef.current.clientWidth;

            if (nameOverflow || subOverflow) {
                return (
                    <div className={styles['team-member-search-item__tooltip']}>
                        <div className={styles['team-member-search-item__tooltip-name']}>{item.fullName}</div>
                        {categoryName && (
                            <div className={styles['team-member-search-item__tooltip-subtitle']}>{categoryName}</div>
                        )}
                    </div>
                );
            }
            return null;
        };

        useImperativeHandle(ref, () => ({
            getTooltipContent,
        }));

        return (
            <div className={styles['team-member-search-item']} data-active={isSearchItemActive || isSearchItemHovered}>
                <div className={styles['team-member-search-item__avatar']} aria-hidden="true">
                    {imageUrl ? (
                        <img src={imageUrl} alt="" className={styles['team-member-search-item__img']} />
                    ) : (
                        <span className={styles['team-member-search-item__initials']}>{initials}</span>
                    )}
                </div>
                <div className={styles['team-member-search-item__info']}>
                    <div ref={nameRef} className={styles['team-member-search-item__name']} title={item.fullName}>
                        {item.fullName}
                    </div>
                    {categoryName && (
                        <div
                            ref={subtitleRef}
                            className={styles['team-member-search-item__subtitle']}
                            title={categoryName}
                        >
                            {categoryName}
                        </div>
                    )}
                </div>
            </div>
        );
    },
);
TeamMemberSearchItem.displayName = 'TeamMemberSearchItem';
