import PropTypes from 'prop-types';
export const Swiper = ({ children }) => <div data-testid="swiper">{children}</div>;
Swiper.propTypes = {
    children: PropTypes.node.isRequired,
};
export const SwiperSlide = ({ children }) => <div data-testid="swiper-slide">{children}</div>;
SwiperSlide.propTypes = {
    children: PropTypes.node.isRequired,
};
export class SwiperClass {
    // this constructor is used just for mocks
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        // mock constructor
    }
}
