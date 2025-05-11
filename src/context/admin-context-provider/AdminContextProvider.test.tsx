import { render, screen } from '@testing-library/react';
import { AdminContextProvider, useAdminContext } from './AdminContextProvider';
import * as loginMethodModule from '../../utils/mock-data/admin-page/loginMethod';

const speGetIsLoginSuccessfulMock = jest.spyOn(loginMethodModule, 'getIsLoginSuccessfulMock');

const ChildComponent = () => {
  const HEADER = 'header'

  const { token } = useAdminContext();

  return (
    <div className='child-component-container'>
      <h1 className='header'>{HEADER}</h1>
      <div className='token'>{token}</div>
    </div>
  )
}

describe('AdminPageContent', () => {
  beforeEach(() => {
    speGetIsLoginSuccessfulMock.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('provides context and renders children when login is successful', async () => {
    const { container } = render(
      <AdminContextProvider>
        <ChildComponent />
      </AdminContextProvider>
    );

    const header = container.querySelector('.header');
    const token = container.querySelector('.token');

    expect(header).toBeInTheDocument();
    expect(token).toBeInTheDocument();

    expect(header?.textContent).toEqual('header');
    expect(token?.textContent).toEqual('fake-token');
  });

  it('provides context and renders children when login is failed', async () => {
    speGetIsLoginSuccessfulMock.mockReturnValue(false); // <-- emulate situation when login is failed

    const { container } = render(
      <AdminContextProvider>
        <ChildComponent />
      </AdminContextProvider>
    );

    const header = container.querySelector('.header');
    const token = container.querySelector('.token');

    expect(header).not.toBeInTheDocument();
    expect(token).not.toBeInTheDocument();

    expect(screen.getByText(/YOU SHALL NOT PASS/i)).toBeInTheDocument();
    expect(screen.getByAltText(/you shall not pass/i)).toBeInTheDocument();
  });
});
