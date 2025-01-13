import styled from 'styled-components';
import { DefaultTheme } from 'styled-components';

interface Props {
    theme: DefaultTheme;
}

export const AppContainer = styled.div<Props>`
    min-height: 100%;
    display: flex;
    flex-direction: column;
`;

export const Header = styled.header<Props>`
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    padding: ${({ theme }) => theme.spacing.lg};
    box-shadow: ${({ theme }) => theme.shadows.medium};
`;

export const Title = styled.h1<Props>`
    font-size: ${({ theme }) => theme.typography.fontSize.xlarge};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    margin: 0;
`;

export const Content = styled.main<Props>`
    flex: 1;
    padding: ${({ theme }) => theme.spacing.lg};
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;

    @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
        padding: ${({ theme }) => theme.spacing.md};
    }
`; 